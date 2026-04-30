# Payload CMS — Work & Posts Migration

**Date:** 2026-04-30
**Status:** Approved
**Scope:** Migrate Work and Thoughts/Posts from static TypeScript files to Payload CMS collections. Add SEO, Redirects, Search, and Vercel Blob plugins.

---

## Goal

Allow new portfolio projects and blog posts to be added and edited from the Payload admin panel at rizwannur.com/admin — instead of manually editing TypeScript data files and redeploying.

## Out of Scope

- `profile.ts` — stays in code (rarely changes, not content)
- `craft.ts` — stays in code (UI component demos, not content)
- Frontend `/search` page — search plugin is set up but UI is not built in this phase
- Draft/preview mode
- Contact form
- Comments

---

## Approach

Option A: Migrate static data files to Payload collections. Pages call Payload's local API. Static data files are deleted. All existing components and page layouts remain unchanged.

---

## Collections

### `work`

Portfolio projects. Replaces `src/data/work.ts`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | yes | e.g. "StoryXen" |
| `slug` | text (unique) | yes | auto-generated from title |
| `subtitle` | text | yes | e.g. "Marketing Website" |
| `cover` | upload → Media | yes | cover image |
| `date` | text | yes | e.g. "Mar 2026" |
| `href` | text | no | live site URL |
| `description` | textarea | yes | one-line summary shown on cards |
| `body` | richText (Lexical) | yes | full project writeup |
| `images` | array | no | gallery images — each item has Media relationship + caption text |
| `order` | number | yes | controls sort order on site (lower = first) |

**Access:** read: public, write: authenticated users only.

---

### `posts`

Blog posts shown under "Thoughts". Replaces `src/data/thoughts.ts`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | yes | |
| `slug` | text (unique) | yes | auto-generated from title |
| `date` | date | yes | publication date |
| `excerpt` | textarea | yes | shown on index page and homepage preview |
| `body` | richText (Lexical) | yes | full post content |
| `readTime` | text | yes | e.g. "6 min read" — entered manually |

**Access:** read: public, write: authenticated users only.

**Lexical features enabled for `body`:**
- Headings: h2, h3, h4
- Bold, italic, underline
- Ordered and unordered lists
- Links (external + internal)
- Inline image uploads (from Media collection)
- Code blocks with syntax highlighting (TypeScript, JavaScript, TSX, JSX, plain text)
- Fixed toolbar + inline floating toolbar

---

## Plugins

### `@payloadcms/plugin-seo`
- Applied to both `work` and `posts` collections
- Adds `meta.title`, `meta.description`, `meta.image` fields in admin
- Used in `generateMetadata()` for each detail page
- Falls back to `title` / `excerpt` / `cover` if meta fields are blank

### `@payloadcms/plugin-redirects`
- Adds a Redirects admin section
- Supports 301/302 redirects
- Integrates with Next.js redirects config
- Used when slugs are renamed

### `@payloadcms/plugin-search`
- Indexes `work` and `posts` collections
- Creates a `search` Payload collection
- Not wired to a frontend page in this phase — ready for future `/search` route

### `@payloadcms/storage-vercel-blob`
- Replaces local disk storage for all Media uploads
- All images stored in Vercel Blob, served via CDN
- Requires `BLOB_READ_WRITE_TOKEN` environment variable

---

## Data Flow

### Fetching data in pages

All pages use Payload's local API (direct database call, no HTTP):

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// All work projects sorted by order
const { docs: workItems } = await payload.find({
  collection: 'work',
  sort: 'order',
  limit: 100,
})

// Single post by slug
const { docs } = await payload.find({
  collection: 'posts',
  where: { slug: { equals: slug } },
  limit: 1,
})
```

### Lexical rich text rendering

Posts detail page renders `body` using the official React renderer:

```ts
import { RichText } from '@payloadcms/richtext-lexical/react'

<RichText data={post.body} />
```

Work detail page also renders `body` via `<RichText>`, replacing the current `item.body.map((p) => <p>{p}</p>)` pattern.

### generateStaticParams

Both `work/[slug]` and `thoughts/[slug]` use `generateStaticParams` powered by Payload queries:

```ts
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'work', limit: 100 })
  return docs.map((item) => ({ slug: item.slug }))
}
```

---

## Pages Changed

| File | Change |
|---|---|
| `src/app/(frontend)/page.tsx` | Fetch first 6 work + first 4 posts from Payload |
| `src/app/(frontend)/work/page.tsx` | Fetch all work from Payload |
| `src/app/(frontend)/work/[slug]/page.tsx` | Fetch by slug, render Lexical body, use SEO meta |
| `src/app/(frontend)/thoughts/page.tsx` | Fetch all posts from Payload |
| `src/app/(frontend)/thoughts/[slug]/page.tsx` | Fetch by slug, render `<RichText>`, use SEO meta |

## Files Deleted

- `src/data/work.ts`
- `src/data/thoughts.ts`

## Files Unchanged

- `src/data/profile.ts`
- `src/data/craft.ts`
- All components in `src/components/site/`
- `src/app/(frontend)/craft/` routes
- `src/app/(frontend)/layout.tsx`

---

## Environment Variables

| Variable | Status | Notes |
|---|---|---|
| `DATABASE_URL` | existing | Neon Postgres |
| `PAYLOAD_SECRET` | existing | |
| `BLOB_READ_WRITE_TOKEN` | new | From Vercel Blob dashboard |

---

## Data Migration

After collections are created, the 7 existing work projects and 4 existing thoughts must be entered into Payload admin manually (or via a one-time seed script). Static files are deleted after migration is confirmed.

---

## Packages to Install

```bash
bun add @payloadcms/plugin-seo @payloadcms/plugin-redirects @payloadcms/plugin-search @payloadcms/storage-vercel-blob
```
