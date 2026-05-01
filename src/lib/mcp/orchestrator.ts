import { getPayload } from 'payload'
import config from '@payload-config'
import { generateImage, type AspectRatio } from './imagegen'
import { checkSeo, type SeoReport } from './validators/seo'
import { suggestInternalLinks, type LinkSuggestion } from './internal-links'
import { validateInlineImages, formatInlineValidationError } from './validators/inline-images'
import { markdownToLexical, substituteInlinePlaceholders } from './lexical'
import { buildPreviewUrl } from './preview'

type ImageSpec =
  | { generate: { prompt: string; alt: string; aspectRatio?: AspectRatio } }
  | { mediaId: number }
  | { skip: true }

export type AuthorBlogPostInput = {
  title: string
  excerpt: string
  body: string
  readTime: string
  tags?: string[]
  slug?: string
  date?: string
  coverImage: ImageSpec
  inlineImages?: Record<
    string,
    { generate?: { prompt: string; alt: string; aspectRatio?: AspectRatio }; mediaId?: number }
  >
  seo?: { title?: string; description?: string; image?: number }
  internalLinks?: 'auto' | 'skip'
  status?: 'draft' | 'published'
  partial?: { coverMediaId?: number; inlineMediaIds?: Record<string, number> }
  force?: boolean
}

export type AuthorBlogPostSuccess = {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published'
  coverMediaId: number | null
  inlineMediaIds: Record<string, number>
  previewUrl: string
  seoReport: SeoReport
  internalLinksAdded: LinkSuggestion[]
}

export type AuthorBlogPostError = {
  error: {
    step:
      | 'placeholder_validation'
      | 'cover_generation'
      | 'inline_generation'
      | 'seo_check'
      | 'post_creation'
      | 'idempotency'
    code: string
    message: string
    remediation: string
    partial: { coverMediaId?: number; inlineMediaIds?: Record<string, number> }
  }
}

export type AuthorBlogPostResult = AuthorBlogPostSuccess | AuthorBlogPostError

function deriveSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function authorBlogPost(input: AuthorBlogPostInput): Promise<AuthorBlogPostResult> {
  const payload = await getPayload({ config })
  const slug = input.slug ?? deriveSlug(input.title)
  const partial = { ...input.partial }

  // 0. Idempotency
  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs[0] && !input.force) {
    const e = existing.docs[0] as any
    return {
      error: {
        step: 'idempotency',
        code: 'slug_exists',
        message: `Post with slug "${slug}" already exists (id: ${e.id}).`,
        remediation: 'Either pick a different slug, call update_post on the existing id, or pass force: true to overwrite is not supported — use update_post.',
        partial,
      },
    }
  }

  // 1. Placeholder ↔ map validation
  const inlineKeys = Object.keys(input.inlineImages ?? {})
  const inlineMapForValidation: Record<string, number> = {}
  for (const k of inlineKeys) inlineMapForValidation[k] = 0 // value irrelevant for shape check
  const v = validateInlineImages(input.body, inlineMapForValidation)
  if (!v.ok) {
    return {
      error: {
        step: 'placeholder_validation',
        code: 'inline_images_invalid',
        message: formatInlineValidationError(v),
        remediation: 'Reconcile body placeholders with inlineImages map and retry.',
        partial,
      },
    }
  }

  // 2. Cover image
  let coverMediaId: number | null = null
  if (partial.coverMediaId !== undefined) {
    coverMediaId = partial.coverMediaId
  } else if ('mediaId' in input.coverImage) {
    coverMediaId = input.coverImage.mediaId
  } else if ('skip' in input.coverImage) {
    coverMediaId = null
  } else {
    try {
      const result = await generateImage({
        prompt: input.coverImage.generate.prompt,
        alt: input.coverImage.generate.alt,
        purpose: 'cover',
        aspectRatio: input.coverImage.generate.aspectRatio ?? '16:9',
      })
      coverMediaId = result.mediaId
      partial.coverMediaId = result.mediaId
    } catch (e) {
      return {
        error: {
          step: 'cover_generation',
          code: 'gemini_failed',
          message: (e as Error).message,
          remediation: 'Adjust the cover prompt or check GEMINI_API_KEY, then retry. Pass `coverImage: { skip: true }` to skip.',
          partial,
        },
      }
    }
  }

  // 3. Inline images (parallel)
  const inlineMediaIds: Record<string, number> = { ...(partial.inlineMediaIds ?? {}) }
  const stillNeeded = inlineKeys.filter((k) => !(k in inlineMediaIds))
  try {
    const results = await Promise.all(
      stillNeeded.map(async (k) => {
        const spec = input.inlineImages![k]
        if (spec.mediaId !== undefined) return { k, mediaId: spec.mediaId }
        if (!spec.generate) {
          throw new Error(`inlineImages.${k}: must have either mediaId or generate.`)
        }
        const r = await generateImage({
          prompt: spec.generate.prompt,
          alt: spec.generate.alt,
          purpose: 'inline',
          aspectRatio: spec.generate.aspectRatio ?? '4:3',
        })
        return { k, mediaId: r.mediaId }
      }),
    )
    for (const { k, mediaId } of results) {
      inlineMediaIds[k] = mediaId
      partial.inlineMediaIds = { ...(partial.inlineMediaIds ?? {}), [k]: mediaId }
    }
  } catch (e) {
    return {
      error: {
        step: 'inline_generation',
        code: 'gemini_failed',
        message: (e as Error).message,
        remediation: 'Adjust the failing prompt and retry; passing partial preserves already-generated images.',
        partial,
      },
    }
  }

  // 4. Internal-link weaving (best-effort suggestion only — we surface, do not edit body)
  let internalLinksAdded: LinkSuggestion[] = []
  if ((input.internalLinks ?? 'auto') === 'auto') {
    try {
      internalLinksAdded = (await suggestInternalLinks({ body: input.body, excludeSlug: slug, limit: 3 })) ?? []
    } catch {
      internalLinksAdded = []
    }
  }
  // We do NOT auto-edit the body — surfacing the suggestions is safer.
  // The agent or user can ask for a follow-up update_post with edited body.

  // 5. SEO check
  const seoReport = await checkSeo({
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    slug,
    metaTitle: input.seo?.title,
    metaDescription: input.seo?.description,
    coverImageId: coverMediaId ?? undefined,
    tags: input.tags,
  })
  if (!seoReport.ok) {
    return {
      error: {
        step: 'seo_check',
        code: 'seo_failed',
        message: 'SEO check has fail-level issues. See seoReport.',
        remediation: 'Fix every fail issue and retry, passing partial to skip image regeneration. Details: ' + JSON.stringify(seoReport.issues.filter((i) => i.level === 'fail')),
        partial,
      },
    }
  }

  // 6. Substitute placeholders + create post
  let processedBody = input.body
  if (Object.keys(inlineMediaIds).length > 0) {
    const resolved: Record<string, { url: string; alt?: string }> = {}
    for (const [k, mediaId] of Object.entries(inlineMediaIds)) {
      const media = (await payload.findByID({ collection: 'media', id: mediaId, overrideAccess: true })) as { url: string; alt?: string }
      resolved[k] = { url: media.url, alt: media.alt }
    }
    processedBody = substituteInlinePlaceholders(input.body, resolved)
  }

  let createdPost: any
  try {
    createdPost = await payload.create({
      collection: 'posts',
      overrideAccess: true,
      draft: (input.status ?? 'draft') === 'draft',
      data: {
        title: input.title,
        excerpt: input.excerpt,
        readTime: input.readTime,
        date: input.date ?? new Date().toISOString(),
        slug,
        ...(input.tags ? { tags: input.tags } : {}),
        ...(coverImageId(coverMediaId)),
        ...(input.seo
          ? {
              meta: {
                ...(input.seo.title !== undefined ? { title: input.seo.title } : {}),
                ...(input.seo.description !== undefined ? { description: input.seo.description } : {}),
                ...(input.seo.image !== undefined ? { image: input.seo.image } : { ...(coverMediaId ? { image: coverMediaId } : {}) }),
              },
            }
          : coverMediaId
            ? { meta: { image: coverMediaId } }
            : {}),
        body: (await markdownToLexical(processedBody, { collection: 'posts', field: 'body' })) as any,
      } as any,
    })
  } catch (e) {
    return {
      error: {
        step: 'post_creation',
        code: 'payload_create_failed',
        message: (e as Error).message,
        remediation: 'Inspect message — may be schema or DB issue. Partial work (images) preserved.',
        partial,
      },
    }
  }

  return {
    id: createdPost.id,
    slug: createdPost.slug,
    title: createdPost.title,
    status: (createdPost._status ?? 'published') as 'draft' | 'published',
    coverMediaId,
    inlineMediaIds,
    previewUrl: buildPreviewUrl({ slug: createdPost.slug }),
    seoReport,
    internalLinksAdded,
  }
}

function coverImageId(id: number | null): Record<string, unknown> {
  return id !== null ? { coverImage: id } : {}
}
