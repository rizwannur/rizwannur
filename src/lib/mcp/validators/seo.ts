import { getPayload } from 'payload'
import config from '@payload-config'

export type SeoCheckInput = {
  title: string
  excerpt: string
  body: string
  slug?: string
  metaTitle?: string
  metaDescription?: string
  coverImageId?: number
  tags?: string[]
  excludePostId?: string
}

export type SeoIssue = {
  level: 'fail' | 'warn'
  rule: string
  message: string
  fix: string
}

export type SeoReport = {
  ok: boolean
  issues: SeoIssue[]
  passed: string[]
}

const H2_RE = /^##\s+\S/m
const ALT_RE = /!\[([^\]]*)\]\([^)]+\)/g
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export async function checkSeo(input: SeoCheckInput): Promise<SeoReport> {
  const issues: SeoIssue[] = []
  const passed: string[] = []
  const metaTitle = input.metaTitle ?? input.title
  const metaDesc = input.metaDescription ?? input.excerpt

  if (metaTitle.length < 30) {
    issues.push({ level: 'warn', rule: 'meta_title_length', message: `Meta title is ${metaTitle.length} chars (min 30 recommended).`, fix: 'Lengthen metaTitle to 30–60 chars.' })
  } else if (metaTitle.length > 70) {
    issues.push({ level: 'fail', rule: 'meta_title_length', message: `Meta title is ${metaTitle.length} chars (max 70).`, fix: 'Shorten metaTitle below 60 chars.' })
  } else if (metaTitle.length > 60) {
    issues.push({ level: 'warn', rule: 'meta_title_length', message: `Meta title is ${metaTitle.length} chars (60 recommended).`, fix: 'Shorten metaTitle to ≤60 chars.' })
  } else passed.push('meta_title_length')

  if (metaDesc.length < 70) {
    issues.push({ level: 'warn', rule: 'meta_description_length', message: `Meta description is ${metaDesc.length} chars (min 70).`, fix: 'Lengthen metaDescription to 70–160 chars.' })
  } else if (metaDesc.length > 160) {
    issues.push({ level: 'fail', rule: 'meta_description_length', message: `Meta description is ${metaDesc.length} chars (max 160).`, fix: 'Shorten metaDescription to ≤160 chars.' })
  } else passed.push('meta_description_length')

  const slug = input.slug ?? input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  if (!SLUG_RE.test(slug)) {
    issues.push({ level: 'fail', rule: 'slug_format', message: `Slug "${slug}" is not lowercase kebab-case.`, fix: 'Use lowercase letters, digits, and single hyphens.' })
  } else if (slug.length > 60) {
    issues.push({ level: 'warn', rule: 'slug_length', message: `Slug is ${slug.length} chars (60 recommended).`, fix: 'Shorten slug to ≤60 chars.' })
  } else passed.push('slug_format')

  // Slug collision (skipped if same post being updated)
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const existing = docs[0]
    if (existing && (!input.excludePostId || String(existing.id) !== input.excludePostId)) {
      issues.push({ level: 'fail', rule: 'slug_collision', message: `Slug "${slug}" already exists on post ${existing.id}.`, fix: 'Pick a different slug.' })
    } else passed.push('slug_unique')
  } catch (e) {
    issues.push({ level: 'warn', rule: 'slug_collision', message: `Could not verify slug uniqueness: ${(e as Error).message}.`, fix: 'Retry or check manually.' })
  }

  if (!H2_RE.test(input.body)) {
    issues.push({ level: 'warn', rule: 'body_h2', message: 'Body has no H2 heading.', fix: 'Add at least one section heading (## Section).' })
  } else passed.push('body_h2')

  if (!input.coverImageId) {
    issues.push({ level: 'warn', rule: 'cover_image', message: 'No cover image set.', fix: 'Generate a cover via generate_image, or pass coverImage.mediaId.' })
  } else passed.push('cover_image')

  const altMatches = [...input.body.matchAll(ALT_RE)]
  const emptyAlts = altMatches.filter((m) => !m[1].trim()).length
  if (emptyAlts > 0) {
    issues.push({ level: 'fail', rule: 'inline_alt_text', message: `${emptyAlts} inline image(s) have empty alt text.`, fix: 'Provide descriptive alt text for every inline image.' })
  } else if (altMatches.length > 0) passed.push('inline_alt_text')

  const tagCount = input.tags?.length ?? 0
  if (tagCount === 0) {
    issues.push({ level: 'warn', rule: 'tag_count', message: 'No tags set.', fix: 'Pick 2–4 tags from existing tags or justify a new one.' })
  } else if (tagCount > 5) {
    issues.push({ level: 'warn', rule: 'tag_count', message: `${tagCount} tags (max 5 recommended).`, fix: 'Reduce to ≤5 tags.' })
  } else passed.push('tag_count')

  const ok = issues.every((i) => i.level !== 'fail')
  return { ok, issues, passed }
}
