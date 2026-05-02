import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { markdownToLexical, lexicalToMarkdown, substituteInlinePlaceholders } from './lexical'
import { generateImage, type AspectRatio } from './imagegen'
import { checkSeo } from './validators/seo'
import { suggestInternalLinks } from './internal-links'
import { buildPreviewUrl } from './preview'
import { postUrls, workUrls, craftUrls } from './urls'
import { validateInlineImages, formatInlineValidationError } from './validators/inline-images'
import { authorBlogPost } from './orchestrator'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mediaRef(m: any): { id: string | number; url: string; alt: string | null; width?: number | null; height?: number | null } | null {
  if (!m || typeof m !== 'object') return null
  return {
    id: m.id,
    url: m.url,
    alt: m.alt ?? null,
    width: m.width ?? null,
    height: m.height ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function postSummary(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    url: postUrls(p.slug).url,
    path: postUrls(p.slug).path,
    title: p.title,
    status: (p._status ?? 'published') as 'draft' | 'published',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function workSummary(w: any) {
  return {
    id: w.id,
    slug: w.slug,
    url: workUrls(w.slug).url,
    path: workUrls(w.slug).path,
    title: w.title,
    status: (w._status ?? 'published') as 'draft' | 'published',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function craftSummary(c: any) {
  return {
    id: c.id,
    slug: c.slug,
    url: craftUrls(c.slug).url,
    path: craftUrls(c.slug).path,
    title: c.title,
  }
}

function errorResult(code: string, message: string, remediation: string, extra?: Record<string, unknown>) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ error: { code, message, remediation, ...(extra ?? {}) } }, null, 2),
      },
    ],
    isError: true,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveInlineBody(payload: any, body: string, inlineImages?: Record<string, number>): Promise<{ ok: true; body: string } | { ok: false; result: ReturnType<typeof errorResult> }> {
  const validation = validateInlineImages(body, inlineImages)
  if (!validation.ok) {
    return {
      ok: false,
      result: errorResult(
        'inline_images_invalid',
        formatInlineValidationError(validation),
        'Fix the body or inlineImages map and retry. Each ![alt](IMG_N) in body must have a matching key in inlineImages, and vice versa.',
      ),
    }
  }
  if (!inlineImages || Object.keys(inlineImages).length === 0) {
    return { ok: true, body }
  }
  const resolved: Record<string, { url: string; alt?: string }> = {}
  for (const [key, mediaId] of Object.entries(inlineImages)) {
    const media = (await payload.findByID({ collection: 'media', id: mediaId, overrideAccess: true })) as { url: string; alt?: string }
    resolved[key] = { url: media.url, alt: media.alt }
  }
  return { ok: true, body: substituteInlinePlaceholders(body, resolved) }
}

// McpServer type is inferred from mcp-handler — no explicit import needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerTools(server: any) {
  const payload = await getPayload({ config })

  // ─── POSTS ──────────────────────────────────────────────────────────────
  // Posts live at /thoughts/{slug} on the public site. NEVER call them /blog
  // — there is no /blog route. Tool outputs include both `path` and `url` so
  // there is no need to construct URLs by hand.

  server.registerTool(
    'list_posts',
    {
      title: 'List Posts (blog / thoughts)',
      description:
        'List blog posts (the site calls them "thoughts"; URL is /thoughts/{slug}, NOT /blog). Sorted newest-first. Returns id, slug, url, path, title, date, readTime, excerpt, tags, coverImage, status.\n\nWhen to use: browse posts, find ids before update/delete, dedup before creating.\n\nNext steps: get_post for full body, update_post / publish_post / unpublish_post / delete_post by id.',
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20).describe('Max results to return (default 20)'),
        page: z.number().int().min(1).default(1).describe('Page number for pagination (default 1)'),
        search: z.string().optional().describe('Case-insensitive substring match against title and excerpt'),
        from: z.string().optional().describe('ISO date — only include posts on or after this date'),
        to: z.string().optional().describe('ISO date — only include posts on or before this date'),
        tag: z.string().optional().describe('Filter by tag (exact match)'),
        status: z.enum(['draft', 'published', 'all']).default('all').describe('Filter by publish status. Default "all" includes both drafts and published.'),
      },
    },
    async ({ limit, page, search, from, to, tag, status }: { limit: number; page: number; search?: string; from?: string; to?: string; tag?: string; status: 'draft' | 'published' | 'all' }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}
      if (search) where.or = [{ title: { contains: search } }, { excerpt: { contains: search } }]
      if (from || to) {
        where.date = {}
        if (from) where.date.greater_than_equal = from
        if (to) where.date.less_than_equal = to
      }
      if (tag) where.tags = { contains: tag }
      if (status !== 'all') where._status = { equals: status }
      const { docs, totalDocs } = await payload.find({
        collection: 'posts',
        sort: '-date',
        limit,
        page,
        depth: 1,
        draft: true,
        overrideAccess: true,
        ...(Object.keys(where).length ? { where } : {}),
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                total: totalDocs,
                page,
                posts: docs.map((p: any) => ({
                  ...postSummary(p),
                  date: p.date,
                  readTime: p.readTime,
                  excerpt: p.excerpt,
                  tags: p.tags ?? [],
                  coverImage: mediaRef(p.coverImage),
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'get_post',
    {
      title: 'Get Post',
      description:
        'Fetch a single post by slug or id with full body (Lexical → markdown). Returns all fields including url, path, status, SEO meta, and inline media list.\n\nWhen to use: before update_post, when you need to see current body or SEO state.\n\nNext steps: update_post, publish_post / unpublish_post, set_post_cover, or check_seo on the returned data.',
      inputSchema: {
        slug: z.string().optional().describe('The post slug, e.g. "my-first-post". Either slug or id must be provided.'),
        id: z.string().optional().describe('Post id. Either slug or id must be provided.'),
      },
    },
    async ({ slug, id }: { slug?: string; id?: string }) => {
      if (!slug && !id) {
        return errorResult('missing_identifier', 'Either slug or id is required.', 'Pass slug or id from list_posts.')
      }
      let p: any
      if (id) {
        try {
          p = await payload.findByID({ collection: 'posts', id, depth: 1, draft: true, overrideAccess: true })
        } catch {
          return errorResult('not_found', `Post with id "${id}" not found.`, 'Use list_posts to see available ids.')
        }
      } else {
        const { docs } = await payload.find({
          collection: 'posts',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
          draft: true,
          overrideAccess: true,
        })
        p = docs[0]
      }
      if (!p) {
        return errorResult('not_found', `Post with slug "${slug}" not found.`, 'Use list_posts to see available slugs.')
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                ...postSummary(p),
                date: p.date,
                readTime: p.readTime,
                excerpt: p.excerpt,
                tags: p.tags ?? [],
                coverImage: mediaRef(p.coverImage),
                seo: p.meta
                  ? {
                      title: p.meta.title ?? null,
                      description: p.meta.description ?? null,
                      image: mediaRef(p.meta.image),
                    }
                  : null,
                body: await lexicalToMarkdown(p.body, { collection: 'posts', field: 'body' }),
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'create_post',
    {
      title: 'Create Post (defaults to DRAFT)',
      description:
        'Create a blog post. DEFAULTS TO DRAFT — pass status: "published" to publish immediately, or call publish_post(id) afterwards. Body is markdown — headings (## h2, ### h3), **bold**, *italic*, [links](url), - lists, 1. ordered lists, ```code blocks``` are supported.\n\nInline images: write ![alt](IMG_1), ![alt](IMG_2) etc. as placeholders in body, then pass inlineImages: { IMG_1: <mediaId>, IMG_2: <mediaId> }. Validation fires on mismatch.\n\nWhen to use: standalone post creation when you already have media ids and SEO done. For full one-pass authoring (text + image gen + SEO + linking), use author_blog_post instead.\n\nReturns id, slug, url (/thoughts/{slug}), path, status, previewUrl. Always share previewUrl with the user before publishing.\n\nNext steps: preview_post → user reviews → publish_post(id) when approved.',
      inputSchema: {
        title: z.string(),
        excerpt: z.string(),
        body: z.string().describe('Markdown. Use ![alt](IMG_N) for inline images.'),
        readTime: z.string().describe('e.g. "5 min read"'),
        date: z.string().optional().describe('ISO date — defaults to today.'),
        slug: z.string().optional().describe('Auto-generated from title if omitted.'),
        tags: z.array(z.string()).optional(),
        coverImage: z.number().int().optional().describe('Media id for cover image.'),
        inlineImages: z.record(z.string(), z.number().int()).optional().describe('Map of IMG_N placeholder → media id, e.g. { IMG_1: 42 }.'),
        status: z.enum(['draft', 'published']).default('draft').describe('Defaults to "draft" so nothing is published without explicit consent. Pass "published" only when the user has approved.'),
        seo: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            image: z.number().int().optional(),
          })
          .optional(),
      },
    },
    async ({ title, excerpt, body, readTime, date, slug, tags, coverImage, inlineImages, status, seo }: any) => {
      const resolved = await resolveInlineBody(payload, body, inlineImages)
      if (!resolved.ok) return resolved.result

      const post = (await payload.create({
        collection: 'posts',
        overrideAccess: true,
        draft: status === 'draft',
        data: {
          title,
          excerpt,
          readTime,
          date: date ?? new Date().toISOString(),
          ...(slug ? { slug } : {}),
          ...(tags ? { tags } : {}),
          ...(coverImage !== undefined ? { coverImage } : {}),
          ...(seo
            ? {
                meta: {
                  ...(seo.title !== undefined ? { title: seo.title } : {}),
                  ...(seo.description !== undefined ? { description: seo.description } : {}),
                  ...(seo.image !== undefined ? { image: seo.image } : {}),
                },
              }
            : {}),
          body: (await markdownToLexical(resolved.body, { collection: 'posts', field: 'body' })) as any,
        },
      } as any)) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                ...postSummary(post),
                previewUrl: buildPreviewUrl({ slug: post.slug, section: 'thoughts' }),
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'update_post',
    {
      title: 'Update Post (content only)',
      description:
        'Update an existing post by id. Only provided fields change. Does NOT change publish status — use publish_post / unpublish_post for that.\n\nWhen updating body with inline images: same ![alt](IMG_N) syntax + inlineImages map as create_post. Validation fires on mismatch.\n\nReturns id, slug, url, path, status, previewUrl.',
      inputSchema: {
        id: z.string(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        body: z.string().optional(),
        readTime: z.string().optional(),
        date: z.string().optional(),
        slug: z.string().optional().describe('Change the URL slug. Affects /thoughts/{slug}.'),
        tags: z.array(z.string()).optional().describe('Pass [] to clear.'),
        coverImage: z.number().int().nullable().optional().describe('Pass null to clear.'),
        inlineImages: z.record(z.string(), z.number().int()).optional(),
        seo: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            image: z.number().int().nullable().optional(),
          })
          .optional(),
      },
    },
    async ({ id, title, excerpt, body, readTime, date, slug, tags, coverImage, inlineImages, seo }: any) => {
      let processedBody: string | undefined
      if (body !== undefined) {
        const resolved = await resolveInlineBody(payload, body, inlineImages)
        if (!resolved.ok) return resolved.result
        processedBody = resolved.body
      }

      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (excerpt !== undefined) data.excerpt = excerpt
      if (readTime !== undefined) data.readTime = readTime
      if (date !== undefined) data.date = date
      if (slug !== undefined) data.slug = slug
      if (tags !== undefined) data.tags = tags
      if (coverImage !== undefined) data.coverImage = coverImage
      if (processedBody !== undefined) data.body = await markdownToLexical(processedBody, { collection: 'posts', field: 'body' })
      if (seo !== undefined) {
        const seoData: Record<string, unknown> = {}
        if (seo.title !== undefined) seoData.title = seo.title
        if (seo.description !== undefined) seoData.description = seo.description
        if (seo.image !== undefined) seoData.image = seo.image
        data.meta = seoData
      }

      const existing = (await payload.findByID({ collection: 'posts', id, draft: true, overrideAccess: true })) as any
      const isDraft = existing?._status === 'draft'
      const post = (await payload.update({ collection: 'posts', id, overrideAccess: true, draft: isDraft, data })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                ...postSummary(post),
                previewUrl: buildPreviewUrl({ slug: post.slug, section: 'thoughts' }),
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'publish_post',
    {
      title: 'Publish Post',
      description:
        'Move a post from draft to published. Atomic — content stays the same, only the publish status flips. After publishing, the post becomes visible at /thoughts/{slug} to all visitors.\n\nWhen to use: user has reviewed previewUrl and approved. Never publish without explicit user approval.',
      inputSchema: {
        id: z.string().describe('Post id from list_posts / create_post.'),
      },
    },
    async ({ id }: { id: string }) => {
      const post = (await payload.update({
        collection: 'posts',
        id,
        overrideAccess: true,
        draft: false,
        data: { _status: 'published' },
      })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(postSummary(post), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'unpublish_post',
    {
      title: 'Unpublish Post (back to draft)',
      description:
        'Revert a published post to draft. The post is no longer visible to public visitors at /thoughts/{slug}; only authed admin users can preview it.\n\nWhen to use: take a post offline temporarily, or revert an accidental publish.',
      inputSchema: {
        id: z.string().describe('Post id from list_posts.'),
      },
    },
    async ({ id }: { id: string }) => {
      const post = (await payload.update({
        collection: 'posts',
        id,
        overrideAccess: true,
        draft: true,
        data: { _status: 'draft' },
      })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(postSummary(post), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'delete_post',
    {
      title: 'Delete Post',
      description:
        'Permanently delete a post by id. Cannot be undone.\n\nWhen to use: explicit user request only. Confirm with list_posts first. Prefer unpublish_post if the user just wants to take it offline.',
      inputSchema: {
        id: z.string().describe('Post id — get this from list_posts'),
      },
    },
    async ({ id }: { id: string }) => {
      await payload.delete({ collection: 'posts', id, overrideAccess: true })
      return { content: [{ type: 'text' as const, text: `Post ${id} permanently deleted.` }] }
    },
  )

  server.registerTool(
    'set_post_cover',
    {
      title: 'Set Post Cover Image',
      description:
        'Set or replace the cover image on a post in one call. Either pass an existing mediaId, or pass a generate spec to create a new image and attach it.\n\nWhen to use: refresh a stale cover, attach a freshly generated image without juggling generate_image + update_post.',
      inputSchema: {
        id: z.string().describe('Post id from list_posts.'),
        source: z
          .union([
            z.object({ mediaId: z.number().int() }).describe('Use an existing media item.'),
            z
              .object({
                generate: z.object({
                  prompt: z.string(),
                  alt: z.string(),
                  aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:4']).optional(),
                }),
              })
              .describe('Generate a new cover with Nano Banana.'),
            z.object({ clear: z.literal(true) }).describe('Remove the current cover.'),
          ])
          .describe('How to source the cover.'),
        updateMetaImage: z.boolean().default(true).describe('Also update SEO meta.image to match. Default true.'),
      },
    },
    async ({ id, source, updateMetaImage }: { id: string; source: any; updateMetaImage: boolean }) => {
      let mediaId: number | null = null
      let generated: { mediaId: number; url: string; alt: string; prompt: string } | null = null

      if ('mediaId' in source) {
        mediaId = source.mediaId
      } else if ('clear' in source) {
        mediaId = null
      } else {
        try {
          generated = await generateImage({
            prompt: source.generate.prompt,
            alt: source.generate.alt,
            purpose: 'cover',
            aspectRatio: source.generate.aspectRatio ?? '16:9',
          })
          mediaId = generated.mediaId
        } catch (e) {
          return errorResult(
            'image_generation_failed',
            (e as Error).message,
            'Adjust the prompt or check GEMINI_API_KEY, then retry. Alternatively pass an existing { mediaId }.',
          )
        }
      }

      const existing = (await payload.findByID({ collection: 'posts', id, draft: true, overrideAccess: true })) as any
      const isDraft = existing?._status === 'draft'

      const data: Record<string, unknown> = { coverImage: mediaId }
      if (updateMetaImage) {
        const currentMeta = (existing.meta ?? {}) as Record<string, unknown>
        data.meta = { ...currentMeta, image: mediaId }
      }

      const post = (await payload.update({ collection: 'posts', id, overrideAccess: true, draft: isDraft, data })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                ...postSummary(post),
                cover: mediaId !== null ? { id: mediaId, url: generated?.url, alt: generated?.alt } : null,
                generated,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  // ─── WORK ───────────────────────────────────────────────────────────────
  // Work items live at /work/{slug}. Outputs include url + path.

  server.registerTool(
    'list_work',
    {
      title: 'List Work',
      description:
        'List work/project items at /work/{slug}, sorted by display order ascending (lower order = higher on the page). Returns id, slug, url, path, title, status, subtitle, description, date, href, order, cover, tech. Supports search, status filter, and pagination.\n\nNext steps: get_work for full body and gallery, update_work to edit, publish_work / unpublish_work for status flips, set_work_images for the gallery, set_work_cover for the cover.',
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(50).describe('Max results to return (default 50)'),
        page: z.number().int().min(1).default(1).describe('Page number (default 1)'),
        search: z.string().optional().describe('Case-insensitive substring match against title, subtitle, description'),
        tech: z.string().optional().describe('Filter by tech stack entry (exact match)'),
        status: z.enum(['draft', 'published', 'all']).default('all').describe('Filter by publish status. Default "all".'),
      },
    },
    async ({ limit, page, search, tech, status }: { limit: number; page: number; search?: string; tech?: string; status: 'draft' | 'published' | 'all' }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}
      if (search) where.or = [
        { title: { contains: search } },
        { subtitle: { contains: search } },
        { description: { contains: search } },
      ]
      if (tech) where.tech = { contains: tech }
      if (status !== 'all') where._status = { equals: status }
      const { docs, totalDocs } = await payload.find({
        collection: 'work',
        sort: 'order',
        limit,
        page,
        depth: 1,
        draft: true,
        overrideAccess: true,
        ...(Object.keys(where).length ? { where } : {}),
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                total: totalDocs,
                page,
                items: docs.map((w: any) => ({
                  ...workSummary(w),
                  subtitle: w.subtitle,
                  description: w.description,
                  date: w.date,
                  href: w.href,
                  order: w.order,
                  tech: w.tech ?? [],
                  cover: mediaRef(w.cover),
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'get_work',
    {
      title: 'Get Work Item',
      description:
        'Fetch full details of a single work item by slug or id, including the body writeup returned as Markdown and the full gallery. Call this before editing — read the current body first, then call update_work with your changes.\n\nReturns id, slug, url, path, all fields, gallery images, SEO.\n\nNext steps: update_work to edit fields, set_work_images for gallery, set_work_cover for cover.',
      inputSchema: {
        slug: z.string().optional().describe('Work item slug. Get slugs from list_work.'),
        id: z.string().optional().describe('Work item id. Either slug or id must be provided.'),
      },
    },
    async ({ slug, id }: { slug?: string; id?: string }) => {
      if (!slug && !id) {
        return errorResult('missing_identifier', 'Either slug or id is required.', 'Pass slug or id from list_work.')
      }
      let w: any
      if (id) {
        try {
          w = await payload.findByID({ collection: 'work', id, depth: 1, draft: true, overrideAccess: true })
        } catch {
          return errorResult('not_found', `Work item with id "${id}" not found.`, 'Use list_work to see available ids.')
        }
      } else {
        const { docs } = await payload.find({
          collection: 'work',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
          draft: true,
          overrideAccess: true,
        })
        w = docs[0]
      }
      if (!w) {
        return errorResult('not_found', `Work item with slug "${slug}" not found.`, 'Use list_work to see available slugs.')
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                ...workSummary(w),
                subtitle: w.subtitle,
                description: w.description,
                date: w.date,
                href: w.href,
                order: w.order,
                tech: w.tech ?? [],
                cover: mediaRef(w.cover),
                images: Array.isArray(w.images)
                  ? w.images.map((it: any) => ({
                      media: mediaRef(it.image),
                      caption: it.caption ?? null,
                    }))
                  : [],
                seo: w.meta
                  ? {
                      title: w.meta.title ?? null,
                      description: w.meta.description ?? null,
                      image: mediaRef(w.meta.image),
                    }
                  : null,
                body: await lexicalToMarkdown(w.body, { collection: 'work', field: 'body' }),
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'create_work',
    {
      title: 'Create Work Item (defaults to DRAFT)',
      description:
        'Add a new project to /work. DEFAULTS TO DRAFT — pass status: "published" to publish immediately, or call publish_work(id) afterwards. subtitle is a short type descriptor like "Marketing Website" or "iOS App". description is the one-liner shown on project cards — keep it to ~15 words. body is the full project writeup in Markdown. href is the live site URL. order controls position — lower = higher on the page; call list_work first to see existing order values and pick a sensible number. cover is a media id from list_media (or use set_work_cover after creation). Gallery images use set_work_images.\n\nReturns id, slug, url (/work/{slug}), path, status.\n\nNext steps: set_work_images to populate gallery, set_work_cover to refresh cover, publish_work after user approval.',
      inputSchema: {
        title: z.string().describe('Project title'),
        subtitle: z.string().describe('Short type descriptor e.g. "Marketing Website", "iOS App", "Brand Identity"'),
        description: z.string().describe('One-liner shown on project cards, ~15 words max'),
        body: z.string().describe('Full project writeup in Markdown'),
        date: z.string().describe('Display date string e.g. "Mar 2026"'),
        order: z.number().int().optional().describe('Display order — lower = higher on page. Default 99. Check list_work for existing values.'),
        href: z.string().optional().describe('Live site URL e.g. "https://example.com"'),
        slug: z.string().optional().describe('URL slug. Auto-generated from title if omitted.'),
        cover: z.number().int().optional().describe('Media id for cover — get from list_media. Or skip and call set_work_cover after.'),
        tech: z.array(z.string()).optional().describe('Tech stack entries e.g. ["Next.js","Tailwind"]'),
        status: z.enum(['draft', 'published']).default('draft').describe('Defaults to "draft" so nothing is published without explicit approval.'),
        seo: z
          .object({
            title: z.string().optional().describe('SEO meta title — defaults to project title if omitted'),
            description: z.string().optional().describe('SEO meta description — defaults to description if omitted'),
            image: z.number().int().optional().describe('Media id for OG/Twitter image — defaults to cover if omitted'),
          })
          .optional()
          .describe('Optional SEO overrides for meta tags and social cards'),
      },
    },
    async ({ title, subtitle, description, body, date, order, href, slug, cover, tech, status, seo }: any) => {
      const item = (await payload.create({
        collection: 'work',
        overrideAccess: true,
        draft: status === 'draft',
        data: {
          title,
          subtitle,
          description,
          date,
          order: order ?? 99,
          ...(href ? { href } : {}),
          ...(slug ? { slug } : {}),
          ...(cover !== undefined ? { cover } : {}),
          ...(tech ? { tech } : {}),
          ...(seo
            ? {
                meta: {
                  ...(seo.title !== undefined ? { title: seo.title } : {}),
                  ...(seo.description !== undefined ? { description: seo.description } : {}),
                  ...(seo.image !== undefined ? { image: seo.image } : {}),
                },
              }
            : {}),
          body: (await markdownToLexical(body, { collection: 'work', field: 'body' })) as any,
        },
      } as any)) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(workSummary(item), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'update_work',
    {
      title: 'Update Work Item',
      description:
        'Update an existing work item by id. Only fields you provide are changed — omit anything to leave it untouched. Pass body as Markdown to update the writeup. Use set_work_cover to set the cover image, set_work_images for the gallery.',
      inputSchema: {
        id: z.string().describe('Work item id — get this from list_work'),
        title: z.string().optional().describe('Updated project title'),
        subtitle: z.string().optional().describe('Updated subtitle e.g. "Marketing Website"'),
        description: z.string().optional().describe('Updated one-liner for project cards'),
        body: z.string().optional().describe('Updated writeup in Markdown'),
        date: z.string().optional().describe('Updated display date e.g. "Mar 2026"'),
        order: z.number().int().optional().describe('Updated display order — lower = higher on page'),
        href: z.string().optional().describe('Updated live site URL'),
        slug: z.string().optional().describe('Change the URL slug. Affects /work/{slug}.'),
        cover: z.number().int().nullable().optional().describe('Media id for the cover image. Pass null to clear.'),
        tech: z.array(z.string()).optional().describe('Replace tech stack entries with this list. Pass [] to clear.'),
        seo: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            image: z.number().int().nullable().optional(),
          })
          .optional()
          .describe('Partial SEO update — only provided keys are changed'),
      },
    },
    async ({ id, title, subtitle, description, body, date, order, href, slug, cover, tech, seo }: any) => {
      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (subtitle !== undefined) data.subtitle = subtitle
      if (description !== undefined) data.description = description
      if (date !== undefined) data.date = date
      if (order !== undefined) data.order = order
      if (href !== undefined) data.href = href
      if (slug !== undefined) data.slug = slug
      if (cover !== undefined) data.cover = cover
      if (tech !== undefined) data.tech = tech
      if (body !== undefined) data.body = (await markdownToLexical(body, { collection: 'work', field: 'body' })) as any
      if (seo !== undefined) {
        const seoData: Record<string, unknown> = {}
        if (seo.title !== undefined) seoData.title = seo.title
        if (seo.description !== undefined) seoData.description = seo.description
        if (seo.image !== undefined) seoData.image = seo.image
        data.meta = seoData
      }

      const existing = (await payload.findByID({ collection: 'work', id, draft: true, overrideAccess: true })) as any
      const isDraft = existing?._status === 'draft'
      const item = (await payload.update({ collection: 'work', id, overrideAccess: true, draft: isDraft, data })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(workSummary(item), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'publish_work',
    {
      title: 'Publish Work Item',
      description:
        'Move a work item from draft to published. After publishing, it becomes visible at /work/{slug} to all visitors.\n\nWhen to use: user has reviewed the draft and approved.',
      inputSchema: {
        id: z.string().describe('Work id from list_work / create_work.'),
      },
    },
    async ({ id }: { id: string }) => {
      const item = (await payload.update({
        collection: 'work',
        id,
        overrideAccess: true,
        draft: false,
        data: { _status: 'published' },
      })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(workSummary(item), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'unpublish_work',
    {
      title: 'Unpublish Work Item (back to draft)',
      description:
        'Revert a published work item to draft. The item is no longer visible at /work/{slug} to public visitors.',
      inputSchema: {
        id: z.string().describe('Work id from list_work.'),
      },
    },
    async ({ id }: { id: string }) => {
      const item = (await payload.update({
        collection: 'work',
        id,
        overrideAccess: true,
        draft: true,
        data: { _status: 'draft' },
      })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(workSummary(item), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'delete_work',
    {
      title: 'Delete Work Item',
      description:
        'Permanently delete a work item by id. This cannot be undone. Confirm the correct item via list_work before calling.',
      inputSchema: {
        id: z.string().describe('Work item id — get this from list_work'),
      },
    },
    async ({ id }: { id: string }) => {
      await payload.delete({ collection: 'work', id, overrideAccess: true })
      return { content: [{ type: 'text' as const, text: `Work item ${id} permanently deleted.` }] }
    },
  )

  server.registerTool(
    'set_work_cover',
    {
      title: 'Set Work Cover Image',
      description:
        'Set or replace the cover image on a work item in one call. Pass an existing { mediaId }, a { generate } spec to create a new image, or { clear: true } to remove. When the work has no upload cover, the public site falls back to a Microlink screenshot of href.',
      inputSchema: {
        id: z.string().describe('Work item id from list_work.'),
        source: z
          .union([
            z.object({ mediaId: z.number().int() }),
            z.object({
              generate: z.object({
                prompt: z.string(),
                alt: z.string(),
                aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:4']).optional(),
              }),
            }),
            z.object({ clear: z.literal(true) }),
          ])
          .describe('How to source the cover.'),
        updateMetaImage: z.boolean().default(true).describe('Also update SEO meta.image to match. Default true.'),
      },
    },
    async ({ id, source, updateMetaImage }: { id: string; source: any; updateMetaImage: boolean }) => {
      let mediaId: number | null = null
      let generated: { mediaId: number; url: string; alt: string; prompt: string } | null = null

      if ('mediaId' in source) {
        mediaId = source.mediaId
      } else if ('clear' in source) {
        mediaId = null
      } else {
        try {
          generated = await generateImage({
            prompt: source.generate.prompt,
            alt: source.generate.alt,
            purpose: 'cover',
            aspectRatio: source.generate.aspectRatio ?? '4:3',
          })
          mediaId = generated.mediaId
        } catch (e) {
          return errorResult(
            'image_generation_failed',
            (e as Error).message,
            'Adjust the prompt or check GEMINI_API_KEY, then retry.',
          )
        }
      }

      const existing = (await payload.findByID({ collection: 'work', id, draft: true, overrideAccess: true })) as any
      const isDraft = existing?._status === 'draft'
      const data: Record<string, unknown> = { cover: mediaId }
      if (updateMetaImage) {
        const currentMeta = (existing.meta ?? {}) as Record<string, unknown>
        data.meta = { ...currentMeta, image: mediaId }
      }
      const item = (await payload.update({ collection: 'work', id, overrideAccess: true, draft: isDraft, data })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                ...workSummary(item),
                cover: mediaId !== null ? { id: mediaId, url: generated?.url, alt: generated?.alt } : null,
                generated,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'set_work_images',
    {
      title: 'Set Work Gallery',
      description:
        'Replace the gallery images on a work item. Pass an array of {mediaId, caption?} in display order. Empty array clears the gallery. Atomic replace — existing entries are dropped. Use list_media to find ids, or generate_image first.',
      inputSchema: {
        id: z.string().describe('Work item id — get this from list_work'),
        images: z
          .array(
            z.object({
              mediaId: z.union([z.string(), z.number().int()]).describe('Media id (string or number — coerced to string).'),
              caption: z.string().optional().describe('Optional caption shown beneath the image'),
            }),
          )
          .describe('Ordered list of gallery images. Pass [] to clear.'),
      },
    },
    async ({ id, images }: { id: string; images: { mediaId: string | number; caption?: string }[] }) => {
      const existing = (await payload.findByID({ collection: 'work', id, draft: true, overrideAccess: true })) as any
      const isDraft = existing?._status === 'draft'
      const item = (await payload.update({
        collection: 'work',
        id,
        overrideAccess: true,
        draft: isDraft,
        data: {
          images: images.map(({ mediaId, caption }) => ({
            image: String(mediaId),
            ...(caption !== undefined ? { caption } : {}),
          })),
        },
      })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ ...workSummary(item), count: item.images?.length ?? 0 }, null, 2),
          },
        ],
      }
    },
  )

  // ─── CRAFT ──────────────────────────────────────────────────────────────

  server.registerTool(
    'list_craft',
    {
      title: 'List Craft',
      description:
        'List craft items at /craft (small UI experiments — components, animations, micro-interactions) sorted by display order ascending. Returns id, slug, url, path, title, date, description, order, cover, tags.',
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(50).describe('Max results (default 50)'),
        page: z.number().int().min(1).default(1).describe('Page (default 1)'),
        search: z.string().optional().describe('Case-insensitive substring match against title and description'),
        tag: z.string().optional().describe('Filter by tag (exact match)'),
      },
    },
    async ({ limit, page, search, tag }: { limit: number; page: number; search?: string; tag?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}
      if (search) where.or = [{ title: { contains: search } }, { description: { contains: search } }]
      if (tag) where.tags = { contains: tag }
      const { docs, totalDocs } = await payload.find({
        collection: 'craft',
        sort: 'order',
        limit,
        page,
        depth: 1,
        overrideAccess: true,
        ...(Object.keys(where).length ? { where } : {}),
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                total: totalDocs,
                page,
                items: docs.map((c: any) => ({
                  ...craftSummary(c),
                  date: c.date,
                  description: c.description,
                  order: c.order,
                  tags: c.tags ?? [],
                  cover: mediaRef(c.cover),
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'get_craft',
    {
      title: 'Get Craft Item',
      description:
        'Fetch full details of a single craft item by slug or id, including credit attribution if set.',
      inputSchema: {
        slug: z.string().optional().describe('Craft item slug. Get slugs from list_craft.'),
        id: z.string().optional().describe('Craft item id.'),
      },
    },
    async ({ slug, id }: { slug?: string; id?: string }) => {
      if (!slug && !id) {
        return errorResult('missing_identifier', 'Either slug or id is required.', 'Pass slug or id from list_craft.')
      }
      let c: any
      if (id) {
        try {
          c = await payload.findByID({ collection: 'craft', id, depth: 1, overrideAccess: true })
        } catch {
          return errorResult('not_found', `Craft item with id "${id}" not found.`, 'Use list_craft to see available ids.')
        }
      } else {
        const { docs } = await payload.find({
          collection: 'craft',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
          overrideAccess: true,
        })
        c = docs[0]
      }
      if (!c) {
        return errorResult('not_found', `Craft item with slug "${slug}" not found.`, 'Use list_craft to see available slugs.')
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                ...craftSummary(c),
                date: c.date,
                description: c.description,
                order: c.order,
                tags: c.tags ?? [],
                cover: mediaRef(c.cover),
                credit: c.credit?.name ? { name: c.credit.name, href: c.credit.href ?? null } : null,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'create_craft',
    {
      title: 'Create Craft Item',
      description:
        'Add a new craft item at /craft/{slug}. These are small focused UI experiments — keep description to one punchy sentence.',
      inputSchema: {
        title: z.string().describe('Craft item title e.g. "Magnetic Button"'),
        description: z.string().describe('One punchy sentence describing the experiment'),
        date: z.string().describe('Display date string e.g. "Apr 2026"'),
        order: z.number().int().optional().describe('Display order — lower = higher on page. Default 99.'),
        slug: z.string().optional().describe('URL slug. Auto-generated from title if omitted.'),
        cover: z.number().int().optional().describe('Media id for the cover image — get ids from list_media.'),
        tags: z.array(z.string()).optional().describe('Topic tags e.g. ["animation","button"]'),
        credit: z
          .object({
            name: z.string().describe('Name of the person or source to credit'),
            href: z.string().optional().describe('Optional link for the credit'),
          })
          .optional()
          .describe('Optional attribution'),
      },
    },
    async ({ title, description, date, order, slug, cover, tags, credit }: any) => {
      const item = (await payload.create({
        collection: 'craft',
        overrideAccess: true,
        draft: false,
        data: {
          title,
          description,
          date,
          order: order ?? 99,
          ...(slug ? { slug } : {}),
          ...(cover !== undefined ? { cover } : {}),
          ...(tags ? { tags } : {}),
          ...(credit ? { credit } : {}),
        },
      } as any)) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(craftSummary(item), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'update_craft',
    {
      title: 'Update Craft Item',
      description:
        'Update an existing craft item by id. Only fields you provide are changed.',
      inputSchema: {
        id: z.string().describe('Craft item id — get this from list_craft'),
        title: z.string().optional().describe('Updated title'),
        description: z.string().optional().describe('Updated one-sentence description'),
        date: z.string().optional().describe('Updated display date e.g. "Apr 2026"'),
        order: z.number().int().optional().describe('Updated display order — lower = higher on page'),
        slug: z.string().optional().describe('Change the URL slug. Affects /craft/{slug}.'),
        cover: z.number().int().nullable().optional().describe('Media id for the cover image. Pass null to clear.'),
        tags: z.array(z.string()).optional().describe('Replace tags with this list. Pass [] to clear.'),
        credit: z
          .object({
            name: z.string(),
            href: z.string().optional(),
          })
          .optional()
          .describe('Updated attribution'),
      },
    },
    async ({ id, title, description, date, order, slug, cover, tags, credit }: any) => {
      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (description !== undefined) data.description = description
      if (date !== undefined) data.date = date
      if (order !== undefined) data.order = order
      if (slug !== undefined) data.slug = slug
      if (cover !== undefined) data.cover = cover
      if (tags !== undefined) data.tags = tags
      if (credit !== undefined) data.credit = credit

      const item = (await payload.update({ collection: 'craft', id, overrideAccess: true, data })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(craftSummary(item), null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'delete_craft',
    {
      title: 'Delete Craft Item',
      description:
        'Permanently delete a craft item by id. This cannot be undone. Confirm via list_craft first.',
      inputSchema: {
        id: z.string().describe('Craft item id — get this from list_craft'),
      },
    },
    async ({ id }: { id: string }) => {
      await payload.delete({ collection: 'craft', id, overrideAccess: true })
      return { content: [{ type: 'text' as const, text: `Craft item ${id} permanently deleted.` }] }
    },
  )

  // ─── MEDIA ──────────────────────────────────────────────────────────────

  server.registerTool(
    'upload_media',
    {
      title: 'Upload Media from URL',
      description:
        'Download an image from a public URL and upload to media library. Returns the full media object: id, filename, url, alt, mimeType, width, height, filesize.\n\nWhen to use: agent already has an image URL (e.g. from a search result). For AI generation, use generate_image instead.\n\nNext steps: pass id to coverImage / set_post_cover / set_work_cover / set_work_images, or include in inlineImages map keyed by IMG_N.',
      inputSchema: {
        url: z.string().url().describe('Public URL of the image to download e.g. "https://example.com/image.jpg"'),
        alt: z.string().describe('Alt text for the image. REQUIRED for accessibility and SEO.'),
        filename: z.string().optional().describe('Filename to save as. Auto-detected from the URL if omitted.'),
      },
    },
    async ({ url, alt, filename }: { url: string; alt: string; filename?: string }) => {
      let response: Response
      try {
        response = await fetch(url)
      } catch (e) {
        return errorResult('fetch_failed', `Failed to fetch image: ${(e as Error).message}`, 'Verify the URL is publicly accessible.')
      }
      if (!response.ok) {
        return errorResult(
          'fetch_failed',
          `Failed to fetch image from URL: ${response.status} ${response.statusText}`,
          'Verify the URL is reachable and returns an image.',
        )
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg'
      if (!contentType.startsWith('image/')) {
        return errorResult('not_an_image', `URL returned content-type "${contentType}" — expected image/*.`, 'Pass an image URL.')
      }

      const buffer = await response.arrayBuffer()
      const name = filename || url.split('/').pop()?.split('?')[0] || 'image.jpg'

      const media = (await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: { alt },
        file: {
          data: Buffer.from(buffer),
          mimetype: contentType,
          name,
          size: buffer.byteLength,
        },
      })) as any

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                id: media.id,
                filename: media.filename,
                url: media.url,
                alt: media.alt,
                mimeType: media.mimeType,
                width: media.width ?? null,
                height: media.height ?? null,
                filesize: media.filesize ?? null,
                hint: `Use as cover: pass id=${media.id} to set_post_cover / set_work_cover / coverImage. For inline images: include in inlineImages map keyed by IMG_N.`,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'list_media',
    {
      title: 'List Media',
      description:
        'List media items newest-first. Returns id, filename, url, alt, dimensions.\n\nWhen to use: find existing images to reuse before generating new ones. Avoid regenerating images that already exist.',
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20).describe('Max results (default 20)'),
        page: z.number().int().min(1).default(1).describe('Page number (default 1)'),
        search: z.string().optional().describe('Case-insensitive substring match against filename and alt text'),
      },
    },
    async ({ limit, page, search }: { limit: number; page: number; search?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}
      if (search) where.or = [{ filename: { contains: search } }, { alt: { contains: search } }]
      const { docs, totalDocs } = await payload.find({
        collection: 'media',
        sort: '-createdAt',
        limit,
        page,
        depth: 0,
        overrideAccess: true,
        ...(Object.keys(where).length ? { where } : {}),
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                total: totalDocs,
                page,
                items: docs.map((m: any) => ({
                  id: m.id,
                  filename: m.filename,
                  url: m.url,
                  alt: m.alt,
                  mimeType: m.mimeType,
                  width: m.width ?? null,
                  height: m.height ?? null,
                  filesize: m.filesize ?? null,
                  createdAt: m.createdAt,
                  updatedAt: m.updatedAt,
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'get_media',
    {
      title: 'Get Media Item',
      description:
        'Fetch a single media item by id. Returns full metadata including url, alt, dimensions, mimeType, filesize.',
      inputSchema: {
        id: z.union([z.string(), z.number().int()]).describe('Media id'),
      },
    },
    async ({ id }: { id: string | number }) => {
      try {
        const m = (await payload.findByID({ collection: 'media', id, overrideAccess: true })) as any
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  id: m.id,
                  filename: m.filename,
                  url: m.url,
                  alt: m.alt,
                  mimeType: m.mimeType,
                  width: m.width ?? null,
                  height: m.height ?? null,
                  filesize: m.filesize ?? null,
                  createdAt: m.createdAt,
                  updatedAt: m.updatedAt,
                },
                null,
                2,
              ),
            },
          ],
        }
      } catch {
        return errorResult('not_found', `Media item with id "${id}" not found.`, 'Use list_media to see available ids.')
      }
    },
  )

  server.registerTool(
    'update_media',
    {
      title: 'Update Media Metadata',
      description:
        'Update the alt text on a media item. Useful when generated images need a more accurate description.',
      inputSchema: {
        id: z.union([z.string(), z.number().int()]).describe('Media id'),
        alt: z.string().describe('New alt text'),
      },
    },
    async ({ id, alt }: { id: string | number; alt: string }) => {
      const m = (await payload.update({ collection: 'media', id, overrideAccess: true, data: { alt } })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: m.id, filename: m.filename, url: m.url, alt: m.alt }, null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'delete_media',
    {
      title: 'Delete Media Item',
      description:
        'Permanently delete a media item by id. WARNING: any post / work item that referenced this media will lose its image. Check usage before deleting.',
      inputSchema: {
        id: z.union([z.string(), z.number().int()]).describe('Media id'),
      },
    },
    async ({ id }: { id: string | number }) => {
      await payload.delete({ collection: 'media', id, overrideAccess: true })
      return { content: [{ type: 'text' as const, text: `Media ${id} permanently deleted.` }] }
    },
  )

  // ─── IMAGE GENERATION ───────────────────────────────────────────────────

  server.registerTool(
    'generate_image',
    {
      title: 'Generate Image with Nano Banana',
      description:
        'Generate a cover or inline body image using Google Gemini 2.5 Flash Image (Nano Banana) and upload it to the media library. Returns { mediaId, url, alt, prompt }. Optionally attach the result directly to a post or work item.\n\nWhen to use: standalone — when you need a single image. For full blog post authoring, prefer author_blog_post which generates everything in one pass.\n\nCost: ~$0.04 per image. Use sparingly inline (0–2 per post typical).\n\nStyle: read site://image-style first so prompts match site visual direction.',
      inputSchema: {
        prompt: z.string().describe('Descriptive prompt. Reference site://image-style for tone/palette/composition guidance.'),
        alt: z.string().describe('Alt text for accessibility. Required.'),
        purpose: z.enum(['cover', 'inline']).describe('"cover" defaults to 16:9 framing; "inline" defaults to 4:3.'),
        aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:4']).optional().describe('Override default aspect ratio.'),
        filename: z.string().optional().describe('Optional filename, auto-generated otherwise.'),
        attach: z
          .object({
            target: z.enum(['post', 'work']).describe('Which collection to attach to.'),
            id: z.string().describe('Document id.'),
            field: z.enum(['cover', 'meta']).default('cover').describe('"cover" sets coverImage / cover. "meta" sets meta.image only.'),
          })
          .optional()
          .describe('Attach the generated image directly to a post or work cover, in one call.'),
      },
    },
    async ({ prompt, alt, purpose, aspectRatio, filename, attach }: { prompt: string; alt: string; purpose: 'cover' | 'inline'; aspectRatio?: AspectRatio; filename?: string; attach?: { target: 'post' | 'work'; id: string; field: 'cover' | 'meta' } }) => {
      let result: { mediaId: number; url: string; alt: string; prompt: string }
      try {
        result = await generateImage({ prompt, alt, purpose, aspectRatio, filename })
      } catch (e) {
        return errorResult(
          'image_generation_failed',
          (e as Error).message,
          'Adjust the prompt or check GEMINI_API_KEY, then retry.',
        )
      }

      let attached: Record<string, unknown> | null = null
      if (attach) {
        const collection = attach.target === 'post' ? 'posts' : 'work'
        const coverField = attach.target === 'post' ? 'coverImage' : 'cover'
        try {
          const existing = (await payload.findByID({ collection, id: attach.id, draft: true, overrideAccess: true })) as any
          const data: Record<string, unknown> = {}
          if (attach.field === 'cover') {
            data[coverField] = result.mediaId
            const currentMeta = (existing.meta ?? {}) as Record<string, unknown>
            data.meta = { ...currentMeta, image: result.mediaId }
          } else {
            const currentMeta = (existing.meta ?? {}) as Record<string, unknown>
            data.meta = { ...currentMeta, image: result.mediaId }
          }
          const isDraft = collection === 'posts' ? existing?._status === 'draft' : false
          const updated = (await payload.update({ collection, id: attach.id, overrideAccess: true, draft: isDraft, data })) as any
          attached = collection === 'posts' ? postSummary(updated) : workSummary(updated)
        } catch (e) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    ...result,
                    warning: `Image generated but attach failed: ${(e as Error).message}. The mediaId is valid — call set_post_cover / set_work_cover manually.`,
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ ...result, ...(attached ? { attached } : {}) }, null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'check_seo',
    {
      title: 'Check SEO',
      description:
        'Validate post SEO fields against site rules. Returns { ok, issues, passed }. Each issue has { level: "fail"|"warn", rule, message, fix }. Run before create_post / publish_post; fix every fail before publishing.',
      inputSchema: {
        title: z.string(),
        excerpt: z.string(),
        body: z.string().describe('Markdown body'),
        slug: z.string().optional().describe('Auto-derived from title if omitted.'),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        coverImageId: z.number().int().optional(),
        tags: z.array(z.string()).optional(),
        excludePostId: z.string().optional().describe('When updating a post, pass its id to skip self-collision detection.'),
      },
    },
    async (args: any) => {
      const report = await checkSeo(args)
      return { content: [{ type: 'text' as const, text: JSON.stringify(report, null, 2) }] }
    },
  )

  server.registerTool(
    'suggest_internal_links',
    {
      title: 'Suggest Internal Links',
      description:
        'Given a draft body, return up to N existing published posts whose topics overlap (keyword overlap, no embeddings). Returns array of { slug, title, excerpt, score, suggestedAnchorText }.',
      inputSchema: {
        body: z.string().describe('Draft markdown body'),
        excludeSlug: z.string().optional().describe('Slug of the post being authored, to exclude from matches.'),
        limit: z.number().int().min(1).max(10).default(5),
      },
    },
    async ({ body, excludeSlug, limit }: { body: string; excludeSlug?: string; limit: number }) => {
      const suggestions = await suggestInternalLinks({ body, excludeSlug, limit })
      return { content: [{ type: 'text' as const, text: JSON.stringify(suggestions, null, 2) }] }
    },
  )

  server.registerTool(
    'preview_post',
    {
      title: 'Get Post Preview URL',
      description:
        'Return a preview URL for a post. Drafts are visible only to authed admin users; published posts visible to all. Share with the user before publishing.\n\nRoute is /thoughts/{slug} — NOT /blog.\n\nNext steps: share previewUrl, wait for approval, then publish_post(id).',
      inputSchema: {
        id: z.string().describe('Post id from list_posts / create_post.'),
      },
    },
    async ({ id }: { id: string }) => {
      const post = (await payload.findByID({ collection: 'posts', id, draft: true, overrideAccess: true })) as { slug: string; _status?: string }
      const previewUrl = buildPreviewUrl({ slug: post.slug, section: 'thoughts' })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ previewUrl, status: post._status ?? 'published' }, null, 2),
          },
        ],
      }
    },
  )

  // ─── ORCHESTRATOR ───────────────────────────────────────────────────────

  server.registerTool(
    'author_blog_post',
    {
      title: 'Author Blog Post (One-Pass)',
      description:
        'Create a complete blog post in a single call. Server-side pipeline:\n  1. Validate ![alt](IMG_N) placeholders match inlineImages keys\n  2. Generate cover image (or use provided mediaId, or skip)\n  3. Generate inline images in parallel\n  4. Suggest internal links (surfaced in result, not auto-edited)\n  5. Run check_seo — abort on any fail issue\n  6. Substitute placeholders → Lexical → create post\n  7. Return previewUrl, url, path\n\nDEFAULTS TO DRAFT. Pass status: "published" only when the user has approved.\n\nOn failure at any step, the response includes error.partial with already-generated mediaIds; retry with `partial` populated to skip redo.\n\nRecommended default for new posts. For edits / refreshes / partial updates, use the atomic tools (generate_image, update_post, set_post_cover, etc.).\n\nBefore calling: read site://voice and site://image-style.\nAfter calling: share previewUrl with user; flip via publish_post on approval.',
      inputSchema: {
        title: z.string(),
        excerpt: z.string(),
        body: z.string().describe('Markdown. Use ![alt](IMG_N) for inline images.'),
        readTime: z.string(),
        tags: z.array(z.string()).optional(),
        slug: z.string().optional(),
        date: z.string().optional(),
        coverImage: z
          .union([
            z.object({ generate: z.object({ prompt: z.string(), alt: z.string(), aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:4']).optional() }) }),
            z.object({ mediaId: z.number().int() }),
            z.object({ skip: z.literal(true) }),
          ])
          .describe('How to obtain the cover image.'),
        inlineImages: z
          .record(
            z.string(),
            z.object({
              generate: z.object({ prompt: z.string(), alt: z.string(), aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:4']).optional() }).optional(),
              mediaId: z.number().int().optional(),
            }),
          )
          .optional()
          .describe('Map of IMG_N → image spec. Each value either { generate: {...} } or { mediaId }.'),
        seo: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            image: z.number().int().optional(),
          })
          .optional(),
        internalLinks: z.enum(['auto', 'skip']).optional().describe('Default "auto" — runs suggester and surfaces matches.'),
        status: z.enum(['draft', 'published']).default('draft').describe('Defaults to "draft". Pass "published" only on explicit approval.'),
        partial: z
          .object({
            coverMediaId: z.number().int().optional(),
            inlineMediaIds: z.record(z.string(), z.number().int()).optional(),
          })
          .optional()
          .describe('Pass on retry to skip already-completed image generations.'),
      },
    },
    async (input: any) => {
      const result = await authorBlogPost(input)
      const isError = 'error' in result
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        ...(isError ? { isError: true } : {}),
      }
    },
  )
}
