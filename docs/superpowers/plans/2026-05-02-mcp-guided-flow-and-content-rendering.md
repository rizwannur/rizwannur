# MCP Guided-Flow + Content Rendering + 404 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AI agents reliably author full blog posts (text + cover + inline images + SEO + draft/publish) end-to-end via MCP, render currently-dead `coverImage`/`tags` fields, and replace the default Next.js 404 with a branded helpful page.

**Architecture:** Next.js App Router (Payload CMS frontend group) for rendering + 404. MCP server gains atomic capability tools (`generate_image`, `check_seo`, `suggest_internal_links`, `preview_post`), workflow prompts (`write_blog_post`, `optimize_seo`, `refresh_cover_image`), markdown resources (`site://voice` etc.), validators for placeholder ↔ inline-image mapping, and a one-pass orchestrator tool `author_blog_post` that runs the entire pipeline server-side with structured `partial` recovery.

**Tech Stack:** Next.js 15 App Router, Payload CMS, `@payloadcms/richtext-lexical`, `mcp-handler`, `zod`, `@google/genai` (Gemini Nano Banana / `gemini-2.5-flash-image`).

**Spec:** `docs/superpowers/specs/2026-05-02-mcp-guided-flow-and-content-rendering-design.md`

---

## File Structure

**Create:**
- `src/app/(frontend)/not-found.tsx` — branded 404
- `src/components/ui/TagChips.tsx` — tag chip row, reused on index + detail
- `src/lib/mcp/imagegen.ts` — Gemini Nano Banana wrapper
- `src/lib/mcp/validators/inline-images.ts` — placeholder ↔ map validator
- `src/lib/mcp/validators/seo.ts` — pure SEO rule engine
- `src/lib/mcp/resources.ts` — registers `site://*` resources
- `src/lib/mcp/resources/voice.md` — hand-written voice guide (stub for Rafey)
- `src/lib/mcp/resources/seo-rules.md` — SEO rules in prose
- `src/lib/mcp/resources/image-style.md` — image style guide (stub for Rafey)
- `src/lib/mcp/prompts.ts` — registers MCP prompts
- `src/lib/mcp/internal-links.ts` — keyword-overlap link suggester
- `src/lib/mcp/preview.ts` — preview URL builder
- `src/lib/mcp/orchestrator.ts` — `author_blog_post` pipeline

**Modify:**
- `src/lib/types/thoughts.ts` — add `coverImage`, `tags`
- `src/components/sections/ThoughtRow.tsx` — render cover thumb + tags
- `src/app/(frontend)/thoughts/page.tsx` — query depth + map fields
- `src/app/(frontend)/thoughts/[slug]/page.tsx` — render hero + tags
- `src/lib/mcp/lexical.ts` — substitute `IMG_N` placeholders in markdown
- `src/lib/mcp/tools.ts` — add `inlineImages` to `create_post`/`update_post`, register all new tools, rewrite descriptions to chain
- `src/app/mcp/route.ts` — register prompts + resources alongside tools
- `package.json` — add `@google/genai`
- `.env.example` (or create) — document `GEMINI_API_KEY`

---

## Conventions

- **Commit after each task.** Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`.
- **Verify before claim:** every task ends with `bun run type-check` + `bun run lint`. Both must pass.
- **No new test framework added.** Validators are pure functions; verify via `tsc` + a smoke script (Task 27). User wants it shipped, not over-tested.
- **Path conventions:** Windows host but project uses POSIX paths in code. Bash shell available.

---

## Task 1: Add `@google/genai` dependency + env var docs

**Files:**
- Modify: `package.json`
- Create or modify: `.env.example`

- [ ] **Step 1: Install package**

```bash
bun add @google/genai
```

- [ ] **Step 2: Verify install**

```bash
grep '"@google/genai"' package.json
```
Expected: shows the package with a version.

- [ ] **Step 3: Add env var to `.env.example`**

If file does not exist, create it. Append:

```
# Google Gemini API key — used by MCP `generate_image` / `author_blog_post`
# Get one at https://aistudio.google.com/apikey
GEMINI_API_KEY=
```

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock .env.example
git commit -m "feat: add @google/genai for Nano Banana image gen"
```

---

## Task 2: Render `coverImage` + `tags` types on Thought type

**Files:**
- Modify: `src/lib/types/thoughts.ts`

- [ ] **Step 1: Replace file contents**

```ts
export type Thought = {
  slug: string
  title: string
  date: string
  readTime: string
  excerpt: string
  body: string[]
  coverImage?: { url: string; alt: string } | null
  tags?: string[]
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types/thoughts.ts
git commit -m "feat: add coverImage and tags to Thought type"
```

---

## Task 3: Build `TagChips` component

**Files:**
- Create: `src/components/ui/TagChips.tsx`

- [ ] **Step 1: Write component**

```tsx
type TagChipsProps = {
  tags: string[]
  className?: string
}

export function TagChips({ tags, className = '' }: TagChipsProps) {
  if (!tags?.length) return null
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[11px] px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/TagChips.tsx
git commit -m "feat: add TagChips component"
```

---

## Task 4: Update `ThoughtRow` to show cover thumb + tags

**Files:**
- Modify: `src/components/sections/ThoughtRow.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAudio } from '@/components/providers/AudioProvider'
import { TagChips } from '@/components/ui/TagChips'
import type { Thought } from '@/lib/types/thoughts'

export function ThoughtRow({ item }: { item: Thought }) {
  const { playClick } = useAudio()
  return (
    <Link href={`/thoughts/${item.slug}`} onClick={() => playClick()} className="group block">
      <div className="flex gap-4 items-start">
        {item.coverImage?.url && (
          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={item.coverImage.url}
              alt={item.coverImage.alt}
              fill
              sizes="(min-width: 640px) 96px, 80px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
            {item.title}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
            <span>{item.date}</span>
            <span aria-hidden>•</span>
            <span>{item.readTime}</span>
          </div>
          {item.excerpt && (
            <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {item.excerpt}
            </p>
          )}
          {item.tags && item.tags.length > 0 && <TagChips tags={item.tags} className="mt-2" />}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ThoughtRow.tsx
git commit -m "feat: render cover thumbnail and tags on ThoughtRow"
```

---

## Task 5: Update thoughts index page to fetch + map cover/tags

**Files:**
- Modify: `src/app/(frontend)/thoughts/page.tsx`

- [ ] **Step 1: Replace `payload.find` block + `thoughtItems` mapping**

Find lines 27-51 (the `payload.find` call and `thoughtItems` map). Replace with:

```ts
  const { docs } = await payload.find({
    collection: 'posts',
    ...(query
      ? {
          where: {
            or: [
              { title: { like: query } },
              { excerpt: { like: query } },
            ],
          },
        }
      : {}),
    sort: '-date',
    limit: 100,
    depth: 1,
  })

  const thoughtItems: Thought[] = docs.map((item) => {
    const cover =
      item.coverImage && typeof item.coverImage === 'object' && 'url' in item.coverImage
        ? { url: (item.coverImage as { url: string }).url, alt: (item.coverImage as { alt?: string }).alt ?? item.title }
        : null
    return {
      slug: item.slug,
      title: item.title,
      date: formatDate(item.date),
      readTime: item.readTime,
      excerpt: item.excerpt,
      body: [],
      coverImage: cover,
      tags: (item.tags as string[] | undefined) ?? [],
    }
  })
```

- [ ] **Step 2: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/thoughts/page.tsx
git commit -m "feat: render coverImage and tags on thoughts index"
```

---

## Task 6: Render hero cover + tag chips on thought detail page

**Files:**
- Modify: `src/app/(frontend)/thoughts/[slug]/page.tsx`

- [ ] **Step 1: Add imports near top (after existing imports)**

```ts
import Image from 'next/image'
import { TagChips } from '@/components/ui/TagChips'
```

- [ ] **Step 2: Replace `<article>` block (currently lines ~80-91)**

```tsx
      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <h1 className="font-display text-3xl leading-tight">{item.title}</h1>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
            {formatDate(item.date)} <span aria-hidden>•</span> {item.readTime}
          </p>
          {item.tags && (item.tags as string[]).length > 0 && (
            <TagChips tags={item.tags as string[]} />
          )}
        </header>

        {item.coverImage && typeof item.coverImage === 'object' && 'url' in item.coverImage && (
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={(item.coverImage as { url: string }).url}
              alt={(item.coverImage as { alt?: string }).alt ?? item.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="rich-text">
          <RichText data={item.body} converters={richTextConverters} />
        </div>
      </article>
```

- [ ] **Step 3: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/thoughts/\[slug\]/page.tsx
git commit -m "feat: render cover hero and tags on thought detail"
```

---

## Task 7: Build branded 404 page

**Files:**
- Create: `src/app/(frontend)/not-found.tsx`

- [ ] **Step 1: Write file**

```tsx
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { SearchInput } from '@/components/ui/SearchInput'
import { Footer } from '@/components/layout/Footer'

export const metadata = { title: 'Page not found — Rafey' }
export const revalidate = 300

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function NotFound() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    sort: '-date',
    limit: 5,
    depth: 0,
    where: { _status: { equals: 'published' } },
  })

  return (
    <PageShell>
      <BackHomeNav />
      <section className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="font-display text-3xl">Page not found</h1>
          <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Try searching the
            thoughts archive or check out a recent post.
          </p>
        </header>

        <SearchInput defaultValue="" placeholder="Search posts..." action="/thoughts" />

        {docs.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-lg">Recent thoughts</h2>
            <ul className="flex flex-col gap-3">
              {docs.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/thoughts/${post.slug}`}
                    className="group flex flex-col gap-0.5"
                  >
                    <span className="text-[15px] font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                      {post.title}
                    </span>
                    <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                      {formatDate(post.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/"
          className="text-[15px] text-neutral-700 dark:text-neutral-300 hover:underline self-start"
        >
          ← Back to home
        </Link>
      </section>
      <Footer />
    </PageShell>
  )
}
```

- [ ] **Step 2: Verify `SearchInput` accepts `action` prop**

```bash
grep -n "action" src/components/ui/SearchInput.tsx
```

If `SearchInput` does not accept an `action` prop, **fall back to a plain form**:

Replace the `<SearchInput ... />` line above with:

```tsx
<form action="/thoughts" method="get" className="w-full">
  <input
    type="search"
    name="q"
    placeholder="Search posts..."
    className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-[15px] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
  />
</form>
```

- [ ] **Step 3: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/not-found.tsx
git commit -m "feat: add branded 404 page with search and recent thoughts"
```

---

## Task 8: Inline-image placeholder validator

**Files:**
- Create: `src/lib/mcp/validators/inline-images.ts`

- [ ] **Step 1: Write file**

```ts
const PLACEHOLDER_RE = /!\[[^\]]*\]\((IMG_\d+)\)/g

export type InlineImagesMap = Record<string, number>

export type InlineValidationResult =
  | { ok: true; placeholders: string[] }
  | {
      ok: false
      missingFromMap: string[]
      unusedInMap: string[]
      duplicates: string[]
    }

export function validateInlineImages(
  body: string,
  map: InlineImagesMap | undefined,
): InlineValidationResult {
  const found = new Set<string>()
  const duplicates: string[] = []
  const matches = body.matchAll(PLACEHOLDER_RE)
  for (const m of matches) {
    const key = m[1]
    if (found.has(key)) duplicates.push(key)
    found.add(key)
  }

  const placeholders = [...found]
  const provided = new Set(Object.keys(map ?? {}))
  const missingFromMap = placeholders.filter((p) => !provided.has(p))
  const unusedInMap = [...provided].filter((p) => !found.has(p))

  if (missingFromMap.length === 0 && unusedInMap.length === 0 && duplicates.length === 0) {
    return { ok: true, placeholders }
  }
  return { ok: false, missingFromMap, unusedInMap, duplicates }
}

export function formatInlineValidationError(r: Extract<InlineValidationResult, { ok: false }>): string {
  const parts: string[] = []
  if (r.missingFromMap.length) {
    parts.push(
      `Body references inline images that are not in inlineImages: ${r.missingFromMap.join(', ')}. ` +
        `Call generate_image for each, then include them in the inlineImages map.`,
    )
  }
  if (r.unusedInMap.length) {
    parts.push(
      `inlineImages contains keys not referenced in body: ${r.unusedInMap.join(', ')}. ` +
        `Either reference them via ![alt](IMG_N) or remove them.`,
    )
  }
  if (r.duplicates.length) {
    parts.push(`Duplicate placeholder references in body: ${r.duplicates.join(', ')}. Each IMG_N should appear once.`)
  }
  return parts.join(' ')
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/validators/inline-images.ts
git commit -m "feat: add inline-image placeholder validator"
```

---

## Task 9: SEO validator

**Files:**
- Create: `src/lib/mcp/validators/seo.ts`

- [ ] **Step 1: Write file**

```ts
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
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/validators/seo.ts
git commit -m "feat: add pure SEO validator"
```

---

## Task 10: Internal-link suggester

**Files:**
- Create: `src/lib/mcp/internal-links.ts`

- [ ] **Step 1: Write file**

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

export type LinkSuggestion = {
  slug: string
  title: string
  excerpt: string
  score: number
  suggestedAnchorText: string
}

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','of','in','on','at','to','for','with','from','by','is','are','was','were','be','been','being','it','this','that','these','those','i','you','we','they','he','she','as','if','then','than','so','not','no','yes','will','would','can','could','should','have','has','had','do','does','did','about','your','my','our','their','its',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  )
}

export async function suggestInternalLinks(args: {
  body: string
  excludeSlug?: string
  limit?: number
}): Promise<LinkSuggestion[]> {
  const { body, excludeSlug, limit = 5 } = args
  const draftTokens = tokenize(body)
  if (draftTokens.size === 0) return []

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-date',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const scored: LinkSuggestion[] = []
  for (const post of docs) {
    if (post.slug === excludeSlug) continue
    const targetText = `${post.title} ${post.excerpt} ${(post.tags as string[] | undefined)?.join(' ') ?? ''}`
    const targetTokens = tokenize(targetText)
    let overlap = 0
    for (const t of targetTokens) if (draftTokens.has(t)) overlap += 1
    if (overlap < 2) continue
    scored.push({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      score: overlap,
      suggestedAnchorText: post.title,
    })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/internal-links.ts
git commit -m "feat: add internal-link suggester"
```

---

## Task 11: Preview URL builder

**Files:**
- Create: `src/lib/mcp/preview.ts`

- [ ] **Step 1: Write file**

```ts
export function buildPreviewUrl(args: { slug: string; baseUrl?: string }): string {
  const base = args.baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  // Posts auto-revalidate; for drafts, slug page renders if user is authed in admin.
  // Return the public slug URL — admin users see drafts; everyone else sees published.
  return `${base.replace(/\/$/, '')}/thoughts/${args.slug}`
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/preview.ts
git commit -m "feat: add preview URL builder"
```

---

## Task 12: Gemini Nano Banana image generation wrapper

**Files:**
- Create: `src/lib/mcp/imagegen.ts`

- [ ] **Step 1: Write file**

```ts
import { GoogleGenAI, Modality } from '@google/genai'
import { getPayload } from 'payload'
import config from '@payload-config'

export type AspectRatio = '16:9' | '4:3' | '1:1' | '3:4'
export type ImagePurpose = 'cover' | 'inline'

export type GeneratedImage = {
  mediaId: number
  url: string
  alt: string
  prompt: string
}

const ASPECT_HINTS: Record<AspectRatio, string> = {
  '16:9': 'Composed for a 16:9 widescreen aspect ratio.',
  '4:3': 'Composed for a 4:3 aspect ratio.',
  '1:1': 'Composed for a 1:1 square aspect ratio.',
  '3:4': 'Composed for a 3:4 portrait aspect ratio.',
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your environment to use generate_image. Get a key at https://aistudio.google.com/apikey.',
    )
  }
  return new GoogleGenAI({ apiKey })
}

async function callGemini(prompt: string, aspectRatio: AspectRatio): Promise<{ data: Buffer; mimeType: string }> {
  const client = getClient()
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts: [{ text: `${prompt}\n\n${ASPECT_HINTS[aspectRatio]}` }] }],
    config: {
      responseModalities: [Modality.IMAGE],
    },
  })

  const parts = response.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData
    if (inline?.data) {
      return {
        data: Buffer.from(inline.data, 'base64'),
        mimeType: inline.mimeType ?? 'image/png',
      }
    }
  }

  const blockReason =
    (response as { promptFeedback?: { blockReason?: string } }).promptFeedback?.blockReason ?? null
  throw new Error(
    blockReason
      ? `Gemini refused the prompt (${blockReason}). Rewrite the prompt to avoid restricted content and retry.`
      : 'Gemini returned no image data. Retry with a clearer or more specific prompt.',
  )
}

function extFromMime(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('jpeg')) return 'jpg'
  if (mime.includes('webp')) return 'webp'
  return 'png'
}

export async function generateImage(args: {
  prompt: string
  alt: string
  purpose: ImagePurpose
  aspectRatio?: AspectRatio
  filename?: string
}): Promise<GeneratedImage> {
  const aspect = args.aspectRatio ?? (args.purpose === 'cover' ? '16:9' : '4:3')
  const { data, mimeType } = await callGemini(args.prompt, aspect)
  const payload = await getPayload({ config })
  const safeSlug = args.alt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'image'
  const ext = extFromMime(mimeType)
  const name = args.filename ?? `${args.purpose}-${safeSlug}-${Date.now()}.${ext}`

  const media = (await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt: args.alt },
    file: { data, mimetype: mimeType, name, size: data.byteLength },
  })) as { id: number; url: string }

  return { mediaId: media.id, url: media.url, alt: args.alt, prompt: args.prompt }
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS. (If `Modality` import path differs in the SDK version installed, run `bun pm ls @google/genai` to confirm version, then check `node_modules/@google/genai` for the correct export — the SDK exposes `Modality` from the root.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/imagegen.ts
git commit -m "feat: add Gemini Nano Banana image generation wrapper"
```

---

## Task 13: Extend `markdownToLexical` to substitute `IMG_N` placeholders

**Files:**
- Modify: `src/lib/mcp/lexical.ts`

- [ ] **Step 1: Add new function exported alongside `markdownToLexical`**

After the `markdownToLexical` function, append:

```ts
const PLACEHOLDER_IMAGE_RE = /!\[([^\]]*)\]\((IMG_\d+)\)/g

export function substituteInlinePlaceholders(
  markdown: string,
  inlineImages: Record<string, { url: string; alt?: string }>,
): string {
  return markdown.replace(PLACEHOLDER_IMAGE_RE, (_match, alt: string, key: string) => {
    const ref = inlineImages[key]
    if (!ref) return _match
    const safeAlt = (alt || ref.alt || '').replace(/"/g, '\\"')
    return `![${safeAlt}](${ref.url})`
  })
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/lexical.ts
git commit -m "feat: substitute IMG_N placeholders before lexical conversion"
```

---

## Task 14: MCP resources — write static markdown stubs

**Files:**
- Create: `src/lib/mcp/resources/voice.md`
- Create: `src/lib/mcp/resources/seo-rules.md`
- Create: `src/lib/mcp/resources/image-style.md`

- [ ] **Step 1: Write `voice.md`** (Rafey will edit later — leave a clear stub)

```md
# Voice

> Edit this file to define the voice of the site. Everything below is a placeholder draft.

- First-person, conversational, calm.
- Short paragraphs. Plain language. Specific over abstract.
- No corporate filler ("solutions", "leverage", "synergy").
- One idea per sentence when possible.
- Show the work: include real numbers, real failures, real tradeoffs.
- Headings tell a story when skimmed. Avoid generic headings like "Conclusion" or "Introduction".
- Code blocks: minimal, runnable, language-tagged.
```

- [ ] **Step 2: Write `seo-rules.md`**

```md
# SEO Rules

These rules mirror what `check_seo` enforces. Pass them all before publishing.

## Meta title
- 30–60 characters (warn outside, fail >70)
- Front-load the keyword
- Distinct from H1 — meta title can be more search-y, H1 can be more human

## Meta description
- 70–160 characters (fail >160)
- Should make someone want to click
- Include the keyword once, naturally

## Slug
- Lowercase kebab-case, ≤60 chars
- No stop words unless they meaningfully change meaning
- Stable forever — never rename a published slug

## Body structure
- At least one H2
- H2s read like a table of contents
- Inline images: every image has descriptive alt text (no empty alts)

## Cover image
- Always set unless the post is intentionally minimal
- Used as default OG / Twitter card image

## Tags
- 2–4 tags, ideally from existing tags (resource: site://existing-tags)
- New tags only when no existing tag fits — justify briefly
```

- [ ] **Step 3: Write `image-style.md`** (Rafey will edit — leave a clear stub)

```md
# Image Style

> Edit this file to lock in the look of generated images. Everything below is a starting draft.

## Mood
- Quiet, considered, technical-but-warm.
- Soft natural light. Honest textures.

## Palette
- Muted neutrals as base.
- One accent color per image, used sparingly.
- Avoid candy-bright saturation.

## Composition
- Negative space welcome.
- Centered or rule-of-thirds.
- Avoid centered text in generated images (Nano Banana renders text but it can be unreliable).

## Avoid
- Stock-photo posing
- Glossy 3D renders unless the post is about 3D
- Brand logos
- Recognizable real people
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/mcp/resources/voice.md src/lib/mcp/resources/seo-rules.md src/lib/mcp/resources/image-style.md
git commit -m "docs: add MCP resource markdown stubs (voice, seo-rules, image-style)"
```

---

## Task 15: MCP resources — register handlers

**Files:**
- Create: `src/lib/mcp/resources.ts`

- [ ] **Step 1: Write file**

```ts
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'

const RESOURCES_DIR = path.join(process.cwd(), 'src/lib/mcp/resources')

async function readStatic(filename: string): Promise<string> {
  return readFile(path.join(RESOURCES_DIR, filename), 'utf8')
}

async function existingTags(): Promise<string> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  const counts = new Map<string, number>()
  for (const doc of docs) {
    for (const tag of (doc.tags as string[] | undefined) ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return [
    '# Existing Tags',
    '',
    'Tags currently used on published posts, sorted by frequency. Reuse these where possible to avoid fragmenting the taxonomy.',
    '',
    ...sorted.map(([tag, count]) => `- \`${tag}\` (${count})`),
  ].join('\n')
}

async function recentPosts(): Promise<string> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-date',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  return [
    '# Recent Posts',
    '',
    'Last 20 published posts. Useful for internal-link weaving and avoiding duplicate topics.',
    '',
    ...docs.map(
      (p) =>
        `- [${p.title}](/thoughts/${p.slug}) — ${new Date(p.date).toISOString().slice(0, 10)} — ${p.excerpt}`,
    ),
  ].join('\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerResources(server: any) {
  const resources: Array<{
    uri: string
    name: string
    description: string
    load: () => Promise<string>
  }> = [
    { uri: 'site://voice', name: 'Site voice guide', description: 'Tone of voice + writing style for blog posts.', load: () => readStatic('voice.md') },
    { uri: 'site://seo-rules', name: 'SEO rules', description: 'SEO ruleset enforced by check_seo, in prose.', load: () => readStatic('seo-rules.md') },
    { uri: 'site://image-style', name: 'Image style guide', description: 'Visual direction for generated cover and inline images.', load: () => readStatic('image-style.md') },
    { uri: 'site://existing-tags', name: 'Existing tags', description: 'Live list of tags on published posts (frequency sorted).', load: existingTags },
    { uri: 'site://recent-posts', name: 'Recent posts', description: 'Last 20 published posts for internal linking and dedup.', load: recentPosts },
  ]

  for (const r of resources) {
    server.registerResource(
      r.name,
      r.uri,
      { description: r.description, mimeType: 'text/markdown' },
      async () => ({
        contents: [{ uri: r.uri, mimeType: 'text/markdown', text: await r.load() }],
      }),
    )
  }
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS. (If `server.registerResource` signature differs, check `mcp-handler` exports — it follows `@modelcontextprotocol/sdk` conventions: `registerResource(name, uri, metadata, handler)`.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/resources.ts
git commit -m "feat: register MCP resources (voice, seo-rules, image-style, tags, recent-posts)"
```

---

## Task 16: Add atomic tool — `generate_image`

**Files:**
- Modify: `src/lib/mcp/tools.ts`

- [ ] **Step 1: Add import at top**

After existing `import { markdownToLexical, lexicalToMarkdown } from './lexical'` add:

```ts
import { generateImage } from './imagegen'
import { checkSeo } from './validators/seo'
import { suggestInternalLinks } from './internal-links'
import { buildPreviewUrl } from './preview'
import { validateInlineImages, formatInlineValidationError } from './validators/inline-images'
import { substituteInlinePlaceholders } from './lexical'
```

(Note: `substituteInlinePlaceholders` may already be implicitly accessible if you re-import `./lexical`. If TS complains about duplicate, merge into the existing import.)

- [ ] **Step 2: Append `generate_image` registration before the closing `}` of `registerTools`**

Insert before the final `}` (after `list_media` registration, ~line 900):

```ts
  // ─── IMAGE GENERATION ───────────────────────────────────────────────────

  server.registerTool(
    'generate_image',
    {
      title: 'Generate Image with Nano Banana',
      description:
        'Generate a cover or inline body image using Google Gemini 2.5 Flash Image (Nano Banana) and upload it to the media library. Returns { mediaId, url, alt, prompt }.\n\nWhen to use: standalone — when you need a single image. For full blog post authoring, prefer author_blog_post which generates everything in one pass.\n\nNext steps: pass mediaId as coverImage in create_post / update_post, or include in inlineImages map keyed by IMG_N.\n\nCost: ~$0.04 per image. Use sparingly inline (0–2 per post typical).\n\nStyle: read site://image-style first so prompts match site visual direction.',
      inputSchema: {
        prompt: z.string().describe('Descriptive prompt. Reference site://image-style for tone/palette/composition guidance.'),
        alt: z.string().describe('Alt text for accessibility. Required.'),
        purpose: z.enum(['cover', 'inline']).describe('"cover" defaults to 16:9 framing; "inline" defaults to 4:3.'),
        aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:4']).optional().describe('Override default aspect ratio.'),
        filename: z.string().optional().describe('Optional filename, auto-generated otherwise.'),
      },
    },
    async ({ prompt, alt, purpose, aspectRatio, filename }: { prompt: string; alt: string; purpose: 'cover' | 'inline'; aspectRatio?: '16:9' | '4:3' | '1:1' | '3:4'; filename?: string }) => {
      try {
        const result = await generateImage({ prompt, alt, purpose, aspectRatio, filename })
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
      } catch (e) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: { code: 'image_generation_failed', message: (e as Error).message, remediation: 'Adjust the prompt or check GEMINI_API_KEY, then retry.' } }, null, 2),
            },
          ],
          isError: true,
        }
      }
    },
  )
```

- [ ] **Step 3: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/mcp/tools.ts
git commit -m "feat(mcp): add generate_image tool (Nano Banana)"
```

---

## Task 17: Add atomic tools — `check_seo`, `suggest_internal_links`, `preview_post`

**Files:**
- Modify: `src/lib/mcp/tools.ts`

- [ ] **Step 1: Append three more registrations before the closing `}` of `registerTools`**

```ts
  server.registerTool(
    'check_seo',
    {
      title: 'Check SEO',
      description:
        'Validate post SEO fields against site rules. Returns { ok, issues, passed }. Each issue has { level: "fail"|"warn", rule, message, fix }. Run before create_post / update_post; fix every fail before publishing.\n\nNext steps: if ok=false, address each fail issue and re-run; if ok=true, proceed to create_post / update_post or author_blog_post.',
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
        'Given a draft body, return up to N existing published posts whose topics overlap (keyword overlap, no embeddings). Returns array of { slug, title, excerpt, score, suggestedAnchorText }.\n\nNext steps: pick 1–3, edit body to weave them in naturally. Or skip if no good matches.',
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
        'Return a preview URL for a post (drafts visible to authed admin users; published posts visible to all). Share with the user before publishing.\n\nNext steps: share previewUrl, wait for approval, then update_post with status: "published".',
      inputSchema: {
        id: z.string().describe('Post id from list_posts / create_post.'),
      },
    },
    async ({ id }: { id: string }) => {
      const post = (await payload.findByID({ collection: 'posts', id, overrideAccess: true })) as { slug: string }
      const previewUrl = buildPreviewUrl({ slug: post.slug })
      return { content: [{ type: 'text' as const, text: JSON.stringify({ previewUrl }, null, 2) }] }
    },
  )
```

- [ ] **Step 2: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/tools.ts
git commit -m "feat(mcp): add check_seo, suggest_internal_links, preview_post tools"
```

---

## Task 18: Extend `create_post` with `inlineImages` placeholder support

**Files:**
- Modify: `src/lib/mcp/tools.ts` (the existing `create_post` registration, ~line 137)

- [ ] **Step 1: Replace the entire `create_post` registration block**

Find `server.registerTool('create_post', ...)` and replace the whole call (description, inputSchema, handler) with:

```ts
  server.registerTool(
    'create_post',
    {
      title: 'Create Post',
      description:
        'Create a blog post (draft or published). Body is markdown — headings (## h2, ### h3), **bold**, *italic*, [links](url), - lists, 1. ordered lists, ```code blocks``` are supported.\n\nInline images: write ![alt](IMG_1), ![alt](IMG_2) etc. as placeholders, then pass inlineImages: { IMG_1: <mediaId>, IMG_2: <mediaId> }. Validation fires on mismatch.\n\nWhen to use: standalone post creation when you already have media ids and SEO done. For full one-pass authoring (text + image gen + SEO + linking), use author_blog_post instead.\n\nNext steps: call preview_post to get the URL, share with user, then update_post to flip to published if currently draft.',
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
        status: z.enum(['draft', 'published']).optional().describe('Defaults to "published".'),
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
      const validation = validateInlineImages(body, inlineImages)
      if (!validation.ok) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: { code: 'inline_images_invalid', message: formatInlineValidationError(validation), remediation: 'Fix the body or inlineImages map and retry.' } }, null, 2),
            },
          ],
          isError: true,
        }
      }

      let processedBody = body
      if (inlineImages && Object.keys(inlineImages).length > 0) {
        const resolved: Record<string, { url: string; alt?: string }> = {}
        for (const [key, mediaId] of Object.entries(inlineImages as Record<string, number>)) {
          const media = (await payload.findByID({ collection: 'media', id: mediaId, overrideAccess: true })) as { url: string; alt?: string }
          resolved[key] = { url: media.url, alt: media.alt }
        }
        processedBody = substituteInlinePlaceholders(body, resolved)
      }

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
          body: (await markdownToLexical(processedBody, { collection: 'posts', field: 'body' })) as any,
        },
      } as any)) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: post.id, slug: post.slug, title: post.title, status: post._status ?? 'published' }, null, 2),
          },
        ],
      }
    },
  )
```

- [ ] **Step 2: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/tools.ts
git commit -m "feat(mcp): add inlineImages placeholder support to create_post"
```

---

## Task 19: Extend `update_post` with `inlineImages` placeholder support

**Files:**
- Modify: `src/lib/mcp/tools.ts` (the existing `update_post` registration)

- [ ] **Step 1: Replace the `update_post` registration block** with:

```ts
  server.registerTool(
    'update_post',
    {
      title: 'Update Post',
      description:
        'Update an existing post by id. Only provided fields change.\n\nWhen updating body with inline images: same ![alt](IMG_N) syntax + inlineImages map as create_post. Validation fires on mismatch.\n\nNext steps: if flipping to "published", consider preview_post first.',
      inputSchema: {
        id: z.string(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        body: z.string().optional(),
        readTime: z.string().optional(),
        date: z.string().optional(),
        tags: z.array(z.string()).optional().describe('Pass [] to clear.'),
        coverImage: z.number().int().nullable().optional().describe('Pass null to clear.'),
        inlineImages: z.record(z.string(), z.number().int()).optional(),
        status: z.enum(['draft', 'published']).optional(),
        seo: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            image: z.number().int().nullable().optional(),
          })
          .optional(),
      },
    },
    async ({ id, title, excerpt, body, readTime, date, tags, coverImage, inlineImages, status, seo }: any) => {
      let processedBody: string | undefined
      if (body !== undefined) {
        const validation = validateInlineImages(body, inlineImages)
        if (!validation.ok) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({ error: { code: 'inline_images_invalid', message: formatInlineValidationError(validation), remediation: 'Fix the body or inlineImages map and retry.' } }, null, 2),
              },
            ],
            isError: true,
          }
        }
        processedBody = body
        if (inlineImages && Object.keys(inlineImages).length > 0) {
          const resolved: Record<string, { url: string; alt?: string }> = {}
          for (const [key, mediaId] of Object.entries(inlineImages as Record<string, number>)) {
            const media = (await payload.findByID({ collection: 'media', id: mediaId, overrideAccess: true })) as { url: string; alt?: string }
            resolved[key] = { url: media.url, alt: media.alt }
          }
          processedBody = substituteInlinePlaceholders(body, resolved)
        }
      }

      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (excerpt !== undefined) data.excerpt = excerpt
      if (readTime !== undefined) data.readTime = readTime
      if (date !== undefined) data.date = date
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
      if (status !== undefined) data._status = status

      const post = (await payload.update({ collection: 'posts', id, overrideAccess: true, draft: status === 'draft', data })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: post.id, slug: post.slug, title: post.title, status: post._status ?? 'published' }, null, 2),
          },
        ],
      }
    },
  )
```

- [ ] **Step 2: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/tools.ts
git commit -m "feat(mcp): add inlineImages placeholder support to update_post"
```

---

## Task 20: One-pass orchestrator — `author_blog_post`

**Files:**
- Create: `src/lib/mcp/orchestrator.ts`

- [ ] **Step 1: Write file**

```ts
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
```

- [ ] **Step 2: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/orchestrator.ts
git commit -m "feat(mcp): add author_blog_post one-pass orchestrator"
```

---

## Task 21: Register `author_blog_post` MCP tool

**Files:**
- Modify: `src/lib/mcp/tools.ts`

- [ ] **Step 1: Add import at top**

```ts
import { authorBlogPost } from './orchestrator'
```

- [ ] **Step 2: Append registration before the closing `}` of `registerTools`**

```ts
  // ─── ORCHESTRATOR ───────────────────────────────────────────────────────

  server.registerTool(
    'author_blog_post',
    {
      title: 'Author Blog Post (One-Pass)',
      description:
        'Create a complete blog post in a single call. Server-side pipeline:\n  1. Validate ![alt](IMG_N) placeholders match inlineImages keys\n  2. Generate cover image (or use provided mediaId, or skip)\n  3. Generate inline images in parallel\n  4. Suggest internal links (surfaced in result, not auto-edited)\n  5. Run check_seo — abort on any fail issue\n  6. Substitute placeholders → Lexical → create post\n  7. Return previewUrl\n\nOn failure at any step, the response includes error.partial with already-generated mediaIds; retry with `partial` populated to skip redo.\n\nRecommended default for new posts. For edits / refreshes / partial updates, use the atomic tools (generate_image, update_post, etc.).\n\nBefore calling: read site://voice and site://image-style.\nAfter calling: share previewUrl with user; flip status via update_post on approval.',
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
        status: z.enum(['draft', 'published']).optional().describe('Default "draft".'),
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
```

- [ ] **Step 3: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/mcp/tools.ts
git commit -m "feat(mcp): register author_blog_post orchestrator tool"
```

---

## Task 22: MCP prompts — register workflow templates

**Files:**
- Create: `src/lib/mcp/prompts.ts`

- [ ] **Step 1: Write file**

```ts
import { z } from 'zod'

const WRITE_BLOG_POST = (args: { topic: string; angle?: string; target_length?: string }) => `
You are authoring a blog post for Rafey's site.

## Step 1 — Load context (read these resources)
- site://voice
- site://seo-rules
- site://image-style
- site://existing-tags
- site://recent-posts

## Step 2 — Plan
Topic: ${args.topic}
Angle: ${args.angle ?? '(decide based on voice + recent posts)'}
Target length: ${args.target_length ?? '~1000 words'}

Write an outline (4–7 sections). Mark sections that benefit from an inline image with [IMG].

## Step 3 — Draft
Write the full body in markdown using site voice. For each [IMG] section, place an ![alt text](IMG_N) placeholder. Number sequentially: IMG_1, IMG_2, etc.

## Step 4 — Plan images
For each placeholder, write a generation prompt that aligns with site://image-style.
Also write a cover image prompt summarizing the post's hook.

## Step 5 — SEO + tags
Compose meta title (30–60 chars) and meta description (70–160 chars).
Pick 2–4 tags. Prefer tags from site://existing-tags. Justify any new tag.

## Step 6 — One call
Call \`author_blog_post\` with everything assembled:
- coverImage: { generate: { prompt, alt, aspectRatio: '16:9' } }
- inlineImages: { IMG_1: { generate: { prompt, alt } }, ... }
- seo, tags, body, etc.
- status: 'draft'

## Step 7 — Recover from errors
If response contains \`error.partial\`, fix the cited issue and retry. Always pass \`partial\` so already-generated images aren't regenerated.

## Step 8 — Hand off
Share \`previewUrl\` with the user. On their approval, call \`update_post\` with status: 'published'.
`

const OPTIMIZE_SEO = (args: { post_id: string }) => `
Optimize SEO for post ${args.post_id}.

1. Call \`get_post\` with id ${args.post_id} to read current state.
2. Call \`check_seo\` with the post's fields.
3. For each fail/warn, propose a specific fix. Summarize the diff.
4. Wait for user approval.
5. On approval, call \`update_post\` with the changes.
6. Re-run \`check_seo\` to confirm zero fails.
`

const REFRESH_COVER = (args: { post_id: string; style_hint?: string }) => `
Refresh the cover image for post ${args.post_id}.

1. Call \`get_post\` with id ${args.post_id}.
2. Read site://image-style.
3. Compose a new prompt for the cover, incorporating: ${args.style_hint ?? '(no style hint — use defaults)'}.
4. Call \`generate_image\` with purpose: 'cover'.
5. Call \`update_post\` with the new coverImage media id.
6. Share the resulting post page URL with the user.
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerPrompts(server: any) {
  server.registerPrompt(
    'write_blog_post',
    {
      title: 'Write a blog post end-to-end',
      description: 'Guided workflow: plan → draft → image prompts → one-call author_blog_post → preview → publish.',
      argsSchema: {
        topic: z.string().describe('What the post is about'),
        angle: z.string().optional().describe('Specific angle / thesis'),
        target_length: z.string().optional().describe('e.g. "800 words"'),
      },
    },
    async (args: { topic: string; angle?: string; target_length?: string }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: WRITE_BLOG_POST(args) } }],
    }),
  )

  server.registerPrompt(
    'optimize_seo',
    {
      title: 'Audit and fix SEO on an existing post',
      description: 'Read post → check_seo → propose diff → user approval → update_post → recheck.',
      argsSchema: {
        post_id: z.string().describe('Id of post to optimize'),
      },
    },
    async (args: { post_id: string }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: OPTIMIZE_SEO(args) } }],
    }),
  )

  server.registerPrompt(
    'refresh_cover_image',
    {
      title: 'Regenerate the cover image for a post',
      description: 'Generate a new cover via Nano Banana and attach it to an existing post.',
      argsSchema: {
        post_id: z.string(),
        style_hint: z.string().optional(),
      },
    },
    async (args: { post_id: string; style_hint?: string }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: REFRESH_COVER(args) } }],
    }),
  )
}
```

- [ ] **Step 2: Type-check**

```bash
bun run type-check
```
Expected: PASS. (If `server.registerPrompt` signature differs, MCP SDK convention is `registerPrompt(name, metadata, handler)`. Check `mcp-handler` if errors.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/prompts.ts
git commit -m "feat(mcp): add workflow prompts (write_blog_post, optimize_seo, refresh_cover_image)"
```

---

## Task 23: Wire prompts + resources into MCP route

**Files:**
- Modify: `src/app/mcp/route.ts`

- [ ] **Step 1: Replace the `createMcpHandler` block**

Find:

```ts
const mcpHandler = createMcpHandler(
  async (server) => {
    await registerTools(server)
  },
  {},
  { basePath: '' },
)
```

Replace with:

```ts
import { registerResources } from '@/lib/mcp/resources'
import { registerPrompts } from '@/lib/mcp/prompts'

const mcpHandler = createMcpHandler(
  async (server) => {
    await registerTools(server)
    await registerResources(server)
    await registerPrompts(server)
  },
  {},
  { basePath: '' },
)
```

(Move the two new imports to the top of the file alongside the existing imports.)

- [ ] **Step 2: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/mcp/route.ts
git commit -m "feat(mcp): mount resources and prompts on MCP route"
```

---

## Task 24: Rewrite descriptions on existing tools to chain explicitly

**Files:**
- Modify: `src/lib/mcp/tools.ts`

- [ ] **Step 1: Update `list_posts` description string**

Find the `list_posts` registration. Replace its `description` field with:

```ts
        'List blog posts sorted newest-first. Returns id, slug, title, date, readTime, excerpt, tags, coverImage, status.\n\nWhen to use: browse posts, find ids before update/delete, dedup before creating.\n\nNext steps: get_post for full body, update_post / delete_post by id.',
```

- [ ] **Step 2: Update `get_post` description**

Find it and replace `description` with:

```ts
        'Fetch a single post by id with full body (Lexical → markdown). Returns all fields.\n\nWhen to use: before update_post, when you need to see current body or SEO state.\n\nNext steps: update_post with changes, or check_seo on the returned data.',
```

- [ ] **Step 3: Update `delete_post` description**

```ts
        'Permanently delete a post by id. Cannot be undone.\n\nWhen to use: explicit user request only. Confirm with list_posts first.\n\nNext steps: none — the post is gone. Inform user.',
```

- [ ] **Step 4: Update `upload_media` description**

```ts
        'Download an image from a public URL and upload to media library. Returns { id, filename, url }.\n\nWhen to use: agent already has an image URL (e.g. from a search result). For AI generation, use generate_image instead.\n\nNext steps: pass id to coverImage / set_work_images, or include in inlineImages map.',
```

- [ ] **Step 5: Update `list_media` description**

```ts
        'List media items newest-first. Returns id, filename, url, alt, dimensions.\n\nWhen to use: find existing images to reuse. Avoid regenerating images that already exist.\n\nNext steps: pass id as coverImage / mediaId in author_blog_post, or include in inlineImages.',
```

- [ ] **Step 6: Update Work + Craft tool descriptions** (sweep)

For each of `list_work`, `get_work`, `create_work`, `update_work`, `delete_work`, `set_work_images`, `list_craft`, `get_craft`, `create_craft`, `update_craft`, `delete_craft`: append to the existing description (do not replace) the line:

```
\n\nNext steps: <pick the most relevant follow-up tool — e.g. get_work for details, update_work for edits, set_work_images for gallery>.
```

This is a focused edit per tool. Read each existing description, add the chain hint that fits.

- [ ] **Step 7: Type-check + lint**

```bash
bun run type-check && bun run lint
```
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/mcp/tools.ts
git commit -m "docs(mcp): rewrite tool descriptions to chain explicitly"
```

---

## Task 25: Smoke-test script for validators + image gen (no test framework)

**Files:**
- Create: `scripts/mcp-smoke.ts`

- [ ] **Step 1: Write file**

```ts
import 'dotenv/config'
import { validateInlineImages, formatInlineValidationError } from '@/lib/mcp/validators/inline-images'
import { checkSeo } from '@/lib/mcp/validators/seo'
import { suggestInternalLinks } from '@/lib/mcp/internal-links'

let pass = 0
let fail = 0

function eq(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    pass += 1
    console.log(`  PASS  ${name}`)
  } else {
    fail += 1
    console.log(`  FAIL  ${name}\n         expected: ${e}\n         actual:   ${a}`)
  }
}

console.log('— inline-images validator —')
{
  const r = validateInlineImages('Hello ![cat](IMG_1) world ![dog](IMG_2)', { IMG_1: 1, IMG_2: 2 })
  eq('all matched', r, { ok: true, placeholders: ['IMG_1', 'IMG_2'] })
}
{
  const r = validateInlineImages('Body ![cat](IMG_1)', {})
  eq('missing from map', r, { ok: false, missingFromMap: ['IMG_1'], unusedInMap: [], duplicates: [] })
}
{
  const r = validateInlineImages('No images', { IMG_1: 1 })
  eq('unused in map', r, { ok: false, missingFromMap: [], unusedInMap: ['IMG_1'], duplicates: [] })
}
{
  const r = validateInlineImages('![a](IMG_1) ![b](IMG_1)', { IMG_1: 1 })
  if (r.ok) {
    fail += 1
    console.log('  FAIL  duplicate detection (got ok=true)')
  } else {
    eq('duplicate keys', r.duplicates, ['IMG_1'])
  }
}

console.log('— SEO validator —')
{
  const r = await checkSeo({
    title: 'Hi',
    excerpt: 'Short',
    body: '## Section\n\nBody',
    tags: ['a'],
  })
  const failRules = r.issues.filter((i) => i.level === 'fail').map((i) => i.rule)
  console.log(`  fail rules: ${failRules.join(', ') || '(none)'}`)
  console.log(`  warn count: ${r.issues.filter((i) => i.level === 'warn').length}`)
}

console.log('— internal links —')
{
  const r = await suggestInternalLinks({ body: 'caching performance nextjs' })
  console.log(`  suggestions: ${r.length}`)
}

console.log(`\nTotal: ${pass} pass, ${fail} fail`)
if (fail > 0) process.exit(1)
```

- [ ] **Step 2: Run it**

```bash
bun scripts/mcp-smoke.ts
```
Expected: all PASS, exit 0. (`internal links` and `SEO` exercises hit Payload — require dev DB up. If DB is down, those two sections may error; that's acceptable for smoke if `inline-images` all PASS.)

- [ ] **Step 3: Commit**

```bash
git add scripts/mcp-smoke.ts
git commit -m "test: add smoke script for MCP validators"
```

---

## Task 26: End-to-end manual verification

**Files:** none modified — this is verification.

- [ ] **Step 1: Start dev server**

```bash
bun dev
```

- [ ] **Step 2: Open thoughts index `http://localhost:3000/thoughts`**

Verify:
- Posts with `coverImage` set show a thumbnail
- Posts with `tags` set show chip row beneath excerpt
- Posts without either still render cleanly (no broken layout)

- [ ] **Step 3: Open a thought detail page**

Verify:
- Cover hero renders above body when set
- Tag chips render in header
- No layout shift / image flicker

- [ ] **Step 4: Hit a non-existent URL e.g. `http://localhost:3000/does-not-exist`**

Verify:
- Branded 404 renders with PageShell
- Search input works (submits to `/thoughts?q=...`)
- Recent thoughts list shows up
- "Back to home" link works

- [ ] **Step 5: Confirm MCP route loads (smoke)**

```bash
curl -i http://localhost:3000/.well-known/oauth-protected-resource
```
Expected: 200 with metadata JSON. (Auth route is intentionally protected — the metadata endpoint should be public.)

- [ ] **Step 6: If any check fails, fix inline and re-run from Step 2.**

- [ ] **Step 7: No commit needed** unless fixes were made; if fixes were made, commit them with the reason.

---

## Task 27: Final sweep — type-check + lint + build

**Files:** none modified.

- [ ] **Step 1: Run full checks**

```bash
bun run type-check && bun run lint && bun run build
```
Expected: all PASS. Build emits production output without errors.

- [ ] **Step 2: If any check fails, fix and recommit.** Do not move on.

- [ ] **Step 3: Final commit (only if changes made during this task)**

```bash
git add -u
git commit -m "chore: final type/lint/build sweep"
```

---

## Self-Review

**Spec coverage check:**
- Part 1 (render coverImage + tags): Tasks 2–6 ✅
- Part 2 (404 page): Task 7 ✅
- Part 3 (MCP overhaul):
  - `generate_image`: Task 12 + 16 ✅
  - `check_seo`: Tasks 9 + 17 ✅
  - `suggest_internal_links`: Tasks 10 + 17 ✅
  - `preview_post`: Tasks 11 + 17 ✅
  - `inlineImages` on create/update: Tasks 8, 13, 18, 19 ✅
  - Prompts: Task 22 ✅
  - Resources: Tasks 14, 15 ✅
  - Tool description rewrites: Task 24 ✅
  - `author_blog_post` orchestrator: Tasks 20, 21 ✅
- Env var docs: Task 1 ✅
- Verification: Tasks 25, 26, 27 ✅

**Placeholder scan:** No TBD/TODO/"appropriate" filler.

**Type consistency:** `Thought.coverImage` shape matches mapping in Task 5/6. `InlineImagesMap` from validator matches schema in tools.ts. `AuthorBlogPostInput` matches Zod schema in Task 21.

Plan is complete.
