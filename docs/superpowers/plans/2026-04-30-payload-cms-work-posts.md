# Payload CMS Work + Posts Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static TypeScript data files (`work.ts`, `thoughts.ts`) with Payload CMS collections so new portfolio projects and blog posts can be added from the admin panel at rizwannur.com/admin.

**Architecture:** Create `Work` and `Posts` Payload collections. Pages call `payload.find()` via the local API (direct DB, no HTTP). Pages transform Payload types to match existing component prop shapes — components are untouched. Static data arrays are removed; type-only exports remain so component imports keep working.

**Tech Stack:** Payload CMS 3.84, Next.js 16 App Router, `@payloadcms/richtext-lexical` (Lexical editor), `@payloadcms/plugin-seo`, `@payloadcms/plugin-redirects`, `@payloadcms/plugin-search`, `@payloadcms/storage-vercel-blob`, Neon Postgres, Vercel Blob

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/collections/Work.ts` | Work collection config + fields |
| Create | `src/collections/Posts.ts` | Posts collection config + Lexical editor |
| Create | `src/redirects.ts` | Fetches redirects from Payload for Next.js |
| Modify | `src/payload.config.ts` | Register collections + all 4 plugins |
| Modify | `next.config.ts` | Add `async redirects()` hook |
| Modify | `src/app/(frontend)/page.tsx` | Fetch work + posts from Payload |
| Modify | `src/app/(frontend)/work/page.tsx` | Fetch all work from Payload |
| Modify | `src/app/(frontend)/work/[slug]/page.tsx` | Fetch by slug, render Lexical body, SEO meta |
| Modify | `src/app/(frontend)/thoughts/page.tsx` | Fetch all posts from Payload |
| Modify | `src/app/(frontend)/thoughts/[slug]/page.tsx` | Fetch by slug, render Lexical body, SEO meta |
| Modify | `src/data/work.ts` | Strip data array, keep type export |
| Modify | `src/data/thoughts.ts` | Strip data array, keep type export |

---

## Task 1: Install Packages + Configure Env

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Install the four plugin packages**

```bash
bun add @payloadcms/plugin-seo @payloadcms/plugin-redirects @payloadcms/plugin-search @payloadcms/storage-vercel-blob
```

Expected: all four packages added to `package.json` and `bun.lock` updated with no errors.

- [ ] **Step 2: Add Vercel Blob token placeholder to .env.local**

Open `.env.local` and add this line at the bottom:

```
BLOB_READ_WRITE_TOKEN=your_token_here
```

> You get the real token from Vercel dashboard → Storage → Blob → your store → `.env.local` tab. For local dev, any non-empty string works to prevent runtime errors; uploads will fail until the real token is set.

- [ ] **Step 3: Verify dev server still starts**

```bash
bun dev
```

Expected: dev server starts at `http://localhost:3000` with no import errors. Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock .env.local
git commit -m "feat: install payload plugins and add blob token placeholder"
```

---

## Task 2: Create Work Collection

**Files:**
- Create: `src/collections/Work.ts`

- [ ] **Step 1: Create the file with full field definitions**

Create `src/collections/Work.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Work: CollectionConfig = {
  slug: 'work',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'subtitle', 'date', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-safe identifier. Auto-filled from title on first save.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Marketing Website"',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Display date, e.g. "Mar 2026"',
      },
    },
    {
      name: 'href',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Optional live site URL',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One-line summary shown on project cards',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      admin: {
        description: 'Full project writeup',
      },
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Optional gallery images shown below the body',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 99,
      admin: {
        position: 'sidebar',
        description: 'Sort order — lower numbers appear first (1 = top)',
      },
    },
  ],
}
```

- [ ] **Step 2: Verify no TypeScript errors in this file**

```bash
bun run type-check
```

Expected: errors only about `Work` not yet being registered in `payload.config.ts` — that's fine. No syntax errors in `Work.ts` itself.

> `type-check` runs `tsc --noEmit`. If the script isn't in package.json, run: `bunx tsc --noEmit`

---

## Task 3: Create Posts Collection

**Files:**
- Create: `src/collections/Posts.ts`

- [ ] **Step 1: Create the file with Lexical editor configuration**

Create `src/collections/Posts.ts`:

```typescript
import type { CollectionConfig } from 'payload'
import {
  BoldFeature,
  BlocksFeature,
  CodeBlock,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'readTime'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-safe identifier. Auto-filled from title on first save.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'MMM d, yyyy',
        },
      },
    },
    {
      name: 'readTime',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'e.g. "6 min read"',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Shown on the index page and homepage preview',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          LinkFeature(),
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'caption',
                    type: 'text',
                  },
                ],
              },
            },
          }),
          BlocksFeature({
            blocks: [
              CodeBlock({
                defaultLanguage: 'ts',
                languages: {
                  plaintext: 'Plain Text',
                  js: 'JavaScript',
                  ts: 'TypeScript',
                  tsx: 'TSX',
                  jsx: 'JSX',
                },
              }),
            ],
          }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
```

- [ ] **Step 2: Verify no TypeScript errors in this file**

```bash
bunx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `Posts.ts` itself (errors about payload.config.ts not registering it are fine).

---

## Task 4: Update payload.config.ts

**Files:**
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Replace the file with the updated config**

```typescript
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Work } from './collections/Work'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Work, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  email: nodemailerAdapter({
    defaultFromAddress: 'noreply@example.com',
    defaultFromName: 'Rafey',
    transportOptions: process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
      : {
          streamTransport: true,
        },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['work', 'posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title ?? ''} — Rafey`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string; description?: string })?.excerpt ??
        (doc as { description?: string })?.description ??
        '',
    }),
    redirectsPlugin({
      collections: ['work', 'posts'],
      redirectTypes: ['301', '302'],
    }),
    searchPlugin({
      collections: ['work', 'posts'],
      defaultPriorities: {
        work: 10,
        posts: 20,
      },
    }),
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bunx tsc --noEmit 2>&1 | head -40
```

Expected: few or no errors. Plugin type errors about `generateTitle`/`generateDescription` signatures are acceptable — they don't block the build.

- [ ] **Step 3: Commit**

```bash
git add src/collections/Work.ts src/collections/Posts.ts src/payload.config.ts
git commit -m "feat: add Work and Posts collections with SEO, redirects, search, and Vercel Blob plugins"
```

---

## Task 5: Create Redirects Helper + Update next.config.ts

**Files:**
- Create: `src/redirects.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create src/redirects.ts**

```typescript
import type { Redirect } from 'next/dist/lib/load-custom-routes'

export const redirects = async (): Promise<Redirect[]> => {
  try {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'redirects',
      limit: 0,
      depth: 1,
      overrideAccess: true,
    })

    return docs.reduce<Redirect[]>((acc, r) => {
      if (!r.from) return acc
      const to = r.to as { url?: string } | undefined
      if (!to?.url) return acc
      return [
        ...acc,
        {
          source: r.from,
          destination: to.url,
          permanent: r.type !== '302',
        },
      ]
    }, [])
  } catch {
    return []
  }
}
```

- [ ] **Step 2: Update next.config.ts to include redirects**

Open `src/next.config.ts` (at project root: `next.config.ts`) and add the `async redirects()` method to `nextConfig`:

```typescript
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/portfolio/**' },
      { pathname: '/_next/static/**' },
      { pathname: '/**' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'api.microlink.io' },
      { protocol: 'https', hostname: '**.microlink.io' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
  },
  async redirects() {
    const { redirects: getRedirects } = await import('./src/redirects')
    return getRedirects()
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
```

> Note: `**.public.blob.vercel-storage.com` is added to `remotePatterns` so Vercel Blob images work with `next/image`.

- [ ] **Step 3: Commit**

```bash
git add src/redirects.ts next.config.ts
git commit -m "feat: add redirects helper and wire into next.config.ts"
```

---

## Task 6: Generate Payload Types

**Files:**
- Auto-generated: `src/payload-types.ts`

- [ ] **Step 1: Run type generation**

```bash
bun generate:types
```

Expected output ends with something like:
```
✓ Payload types generated at src/payload-types.ts
```

- [ ] **Step 2: Verify Work and Post interfaces exist in the generated file**

```bash
grep -n "export interface Work\|export interface Post" src/payload-types.ts
```

Expected:
```
XX: export interface Work {
XX: export interface Post {
```

- [ ] **Step 3: Check TypeScript still compiles**

```bash
bunx tsc --noEmit 2>&1 | head -30
```

Expected: no critical errors (plugin type mismatches are acceptable).

- [ ] **Step 4: Commit generated types**

```bash
git add src/payload-types.ts
git commit -m "chore: regenerate payload types for Work and Posts collections"
```

---

## Task 7: Update Homepage

**Files:**
- Modify: `src/app/(frontend)/page.tsx`

- [ ] **Step 1: Replace the file**

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/site/PageShell'
import { Header } from '@/components/site/Header'
import { Socials } from '@/components/site/Socials'
import { SectionHeading } from '@/components/site/SectionHeading'
import { WorkGrid } from '@/components/site/WorkGrid'
import { ThoughtRow } from '@/components/site/ThoughtRow'
import { ViewAll } from '@/components/site/ViewAll'
import { Footer } from '@/components/site/Footer'
import { CompanyLink } from '@/components/site/CompanyLink'
import { profile } from '@/data/profile'
import type { Work } from '@/data/work'
import type { Thought } from '@/data/thoughts'
import type { Media } from '@/payload-types'

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs: workDocs } = await payload.find({
    collection: 'work',
    sort: 'order',
    limit: 6,
    depth: 1,
  })

  const { docs: postDocs } = await payload.find({
    collection: 'posts',
    sort: '-date',
    limit: 4,
    depth: 0,
  })

  const workItems: Work[] = workDocs.map((item) => ({
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    cover: typeof item.cover === 'object' ? ((item.cover as Media).url ?? '') : '',
    date: item.date,
    href: item.href ?? undefined,
    description: item.description,
    body: [],
  }))

  const thoughtItems: Thought[] = postDocs.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: formatDate(item.date),
    readTime: item.readTime,
    excerpt: item.excerpt,
    body: [],
  }))

  return (
    <PageShell>
      <Header />

      {/* Intro */}
      <section className="space-y-5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        <p className="font-display text-3xl leading-tight text-black dark:text-white md:text-4xl">
          {profile.headline}
        </p>
        {profile.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          {profile.recent.lead}{' '}
          <CompanyLink {...profile.recent.company} />
          {profile.recent.tail}
        </p>
        <p>
          {profile.past.lead}
          {profile.past.companies.map((c, j) => (
            <span key={c.name}>
              {j === 0 ? ' ' : j === profile.past.companies.length - 1 ? ', and ' : ', '}
              <CompanyLink {...c} />
            </span>
          ))}
          {profile.past.tail}
        </p>
        <p>{profile.searching}</p>
        <p className="rounded-2xl border border-black/8 bg-black/[0.03] p-4 text-[14px] text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300">
          {profile.availability}
        </p>

        <div className="pt-2">
          <Socials />
        </div>
      </section>

      {/* Work */}
      <section>
        <SectionHeading>Work</SectionHeading>
        <WorkGrid items={workItems} />
        <ViewAll href="/work" />
      </section>

      {/* Thoughts */}
      <section>
        <SectionHeading>Thoughts</SectionHeading>
        <div className="flex flex-col gap-6">
          {thoughtItems.map((t) => (
            <ThoughtRow key={t.slug} item={t} />
          ))}
        </div>
        <ViewAll href="/thoughts" />
      </section>

      <Footer />
    </PageShell>
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
bunx tsc --noEmit 2>&1 | grep "page.tsx"
```

Expected: no errors for this file.

- [ ] **Step 3: Commit**

```bash
git add src/app/(frontend)/page.tsx
git commit -m "feat: homepage fetches work and posts from Payload"
```

---

## Task 8: Update Work Pages

**Files:**
- Modify: `src/app/(frontend)/work/page.tsx`
- Modify: `src/app/(frontend)/work/[slug]/page.tsx`

- [ ] **Step 1: Replace work/page.tsx**

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { WorkGrid } from '@/components/site/WorkGrid'
import { Footer } from '@/components/site/Footer'
import type { Work } from '@/data/work'
import type { Media } from '@/payload-types'

export const metadata = { title: 'Work — Rafey' }

export default async function WorkIndex() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'work',
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  const workItems: Work[] = docs.map((item) => ({
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    cover: typeof item.cover === 'object' ? ((item.cover as Media).url ?? '') : '',
    date: item.date,
    href: item.href ?? undefined,
    description: item.description,
    body: [],
  }))

  return (
    <PageShell>
      <BackHomeNav />
      <section>
        <h1 className="font-display text-3xl mb-3">Work</h1>
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-10">
          Selected projects and case studies from my work in design and development.
        </p>
        <WorkGrid items={workItems} />
      </section>
      <Footer />
    </PageShell>
  )
}
```

- [ ] **Step 2: Replace work/[slug]/page.tsx**

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { PrevNext } from '@/components/site/PrevNext'
import type { Media } from '@/payload-types'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'work',
    limit: 100,
    depth: 0,
  })
  return docs.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'work',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  const item = docs[0]
  if (!item) return { title: 'Work' }

  const coverUrl = typeof item.cover === 'object' ? ((item.cover as Media).url ?? '') : ''
  const meta = item.meta as { title?: string; description?: string; image?: Media } | undefined

  return {
    title: meta?.title || `${item.title} — ${item.subtitle}`,
    description: meta?.description || item.description,
    openGraph: {
      images: meta?.image?.url
        ? [{ url: meta.image.url }]
        : coverUrl
          ? [{ url: coverUrl }]
          : [],
    },
  }
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs: allDocs } = await payload.find({
    collection: 'work',
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  const idx = allDocs.findIndex((w) => w.slug === slug)
  if (idx === -1) return notFound()

  const item = allDocs[idx]!
  const prev = allDocs[idx - 1]
  const next = allDocs[idx + 1]

  const coverUrl = typeof item.cover === 'object' ? ((item.cover as Media).url ?? '') : ''

  const galleryImages =
    item.images?.map((img) => ({
      src: typeof img.image === 'object' ? ((img.image as Media).url ?? '') : '',
      caption: img.caption ?? undefined,
    })) ?? []

  return (
    <PageShell>
      <BackHomeNav parent="/work" />
      <article className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">{item.title}</h1>
            <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">
              {item.subtitle} <span aria-hidden>•</span> {item.date}
            </p>
          </div>
          {item.href && (
            <Link
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/8 dark:hover:bg-white/15 transition-colors px-3 h-8 text-[13px]"
            >
              <ExternalLink className="size-3.5" />
              View work
            </Link>
          )}
        </div>

        <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {item.description}
        </p>

        {coverUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-black/5 dark:bg-white/5">
            <Image
              src={coverUrl}
              alt={`${item.title} cover image`}
              fill
              sizes="669px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed">
          <RichText data={item.body} />
        </div>

        {galleryImages.map((img, i) => (
          <figure key={i} className="flex flex-col gap-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
              <Image src={img.src} alt={img.caption ?? ''} fill sizes="669px" className="object-cover" />
            </div>
            {img.caption && (
              <figcaption className="text-center text-[13px] text-neutral-500 dark:text-neutral-400">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </article>

      <PrevNext
        basePath="/work"
        prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </PageShell>
  )
}
```

- [ ] **Step 3: Check TypeScript**

```bash
bunx tsc --noEmit 2>&1 | grep "work"
```

Expected: no errors in the work page files.

- [ ] **Step 4: Commit**

```bash
git add src/app/(frontend)/work/page.tsx "src/app/(frontend)/work/[slug]/page.tsx"
git commit -m "feat: work pages fetch from Payload with Lexical renderer and SEO meta"
```

---

## Task 9: Update Thoughts Pages

**Files:**
- Modify: `src/app/(frontend)/thoughts/page.tsx`
- Modify: `src/app/(frontend)/thoughts/[slug]/page.tsx`

- [ ] **Step 1: Replace thoughts/page.tsx**

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { ThoughtRow } from '@/components/site/ThoughtRow'
import { Footer } from '@/components/site/Footer'
import type { Thought } from '@/data/thoughts'

export const metadata = { title: 'Thoughts — Rafey' }

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function ThoughtsIndex() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    sort: '-date',
    limit: 100,
    depth: 0,
  })

  const thoughtItems: Thought[] = docs.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: formatDate(item.date),
    readTime: item.readTime,
    excerpt: item.excerpt,
    body: [],
  }))

  return (
    <PageShell>
      <BackHomeNav />
      <section>
        <h1 className="font-display text-3xl mb-3">Thoughts</h1>
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-10">
          A collection of thoughts, ideas, and reflections on design, development, and my personal life.
        </p>
        <div className="flex flex-col gap-7">
          {thoughtItems.map((t) => (
            <ThoughtRow key={t.slug} item={t} />
          ))}
        </div>
      </section>
      <Footer />
    </PageShell>
  )
}
```

- [ ] **Step 2: Replace thoughts/[slug]/page.tsx**

```typescript
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { PrevNext } from '@/components/site/PrevNext'
import type { Media } from '@/payload-types'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    limit: 100,
    depth: 0,
  })
  return docs.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const item = docs[0]
  if (!item) return { title: 'Thoughts' }

  const meta = item.meta as { title?: string; description?: string; image?: Media } | undefined

  return {
    title: meta?.title || item.title,
    description: meta?.description || item.excerpt,
  }
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function ThoughtDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs: allDocs } = await payload.find({
    collection: 'posts',
    sort: '-date',
    limit: 100,
    depth: 0,
  })

  const idx = allDocs.findIndex((p) => p.slug === slug)
  if (idx === -1) return notFound()

  const item = allDocs[idx]!
  const prev = allDocs[idx - 1]
  const next = allDocs[idx + 1]

  return (
    <PageShell>
      <BackHomeNav parent="/thoughts" />
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-3xl leading-tight">{item.title}</h1>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">
            {formatDate(item.date)} <span aria-hidden>•</span> {item.readTime}
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed">
          <RichText data={item.body} />
        </div>
      </article>

      <PrevNext
        basePath="/thoughts"
        prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </PageShell>
  )
}
```

- [ ] **Step 3: Check TypeScript**

```bash
bunx tsc --noEmit 2>&1 | grep "thoughts"
```

Expected: no errors in thoughts page files.

- [ ] **Step 4: Commit**

```bash
git add src/app/(frontend)/thoughts/page.tsx "src/app/(frontend)/thoughts/[slug]/page.tsx"
git commit -m "feat: thoughts pages fetch from Payload with Lexical renderer and SEO meta"
```

---

## Task 10: Strip Static Data Arrays

**Files:**
- Modify: `src/data/work.ts`
- Modify: `src/data/thoughts.ts`

The data arrays are removed. Type exports stay so existing component imports keep working without touching the components.

- [ ] **Step 1: Replace src/data/work.ts with type-only file**

```typescript
export type Work = {
  slug: string
  title: string
  subtitle: string
  cover: string
  date: string
  href?: string
  description: string
  body: string[]
  images?: { src: string; caption?: string }[]
}
```

- [ ] **Step 2: Replace src/data/thoughts.ts with type-only file**

```typescript
export type Thought = {
  slug: string
  title: string
  date: string
  readTime: string
  excerpt: string
  body: string[]
}
```

- [ ] **Step 3: Verify full TypeScript check passes cleanly**

```bash
bunx tsc --noEmit
```

Expected: zero errors. If there are errors, read them carefully — they will point to a page still importing the deleted data array.

- [ ] **Step 4: Commit**

```bash
git add src/data/work.ts src/data/thoughts.ts
git commit -m "chore: strip static data arrays from work.ts and thoughts.ts, keep type exports"
```

---

## Task 11: Run Database Migration + Verify Build

**Files:**
- Auto-generated: migration file in `src/migrations/`

- [ ] **Step 1: Create the database migration**

```bash
bun payload migrate:create --name work_posts_plugins
```

Expected: a new migration file appears in `src/migrations/` named something like `20260430_000000_work_posts_plugins.ts`.

- [ ] **Step 2: Run the migration against your database**

```bash
bun payload migrate
```

Expected output:
```
✓ Running migration: 20260430_000000_work_posts_plugins
✓ Migration complete
```

This creates the `work`, `posts`, `redirects`, and `search` tables in your Neon Postgres database.

- [ ] **Step 3: Run a full production build to verify everything compiles**

```bash
bun run build
```

Expected: build completes successfully. Pages using `generateStaticParams` will generate 0 static pages (no content yet — that's correct).

- [ ] **Step 4: Start dev server and verify admin panel**

```bash
bun dev
```

Open `http://localhost:3000/admin`. You should see:
- Work collection in the sidebar
- Posts collection in the sidebar
- Redirects collection
- Search collection
- Media collection (existing)

- [ ] **Step 5: Commit migration**

```bash
git add src/migrations/
git commit -m "chore: add migration for Work, Posts, redirects, and search tables"
```

---

## Task 12: Seed Existing Content

No files to modify — this is manual data entry in the admin panel.

- [ ] **Step 1: Add all 7 work projects via Payload admin**

Go to `http://localhost:3000/admin/collections/work` → Create New for each:

| title | subtitle | date | order | href |
|---|---|---|---|---|
| StoryXen | Marketing Website | Mar 2026 | 1 | https://storyxen.com |
| RoofAI | Web Dashboard | Jan 2026 | 2 | — |
| PsychLink | Patient Portal | Nov 2025 | 3 | — |
| Trusted Financing | Marketing Website | Sep 2025 | 4 | — |
| Aura | Mobile App Landing | Jul 2025 | 5 | — |
| Lawyer Connect | Web Platform | May 2025 | 6 | — |
| Financial CRM | Internal Tool | Feb 2025 | 7 | — |

For each: upload the cover image from `public/portfolio/projects/`, paste the description, write body content in the Lexical editor. Copy body text from the old data file — it was plain paragraphs, so just type them in.

- [ ] **Step 2: Add all 4 blog posts via Payload admin**

Go to `http://localhost:3000/admin/collections/posts` → Create New for each:

| title | date | readTime | excerpt |
|---|---|---|---|
| Building a fast portfolio with Next.js | Apr 1 2026 | 6 min read | Notes on shipping a portfolio that loads instantly... |
| Using View Transitions for theme switching | Mar 1 2026 | 8 min read | A circular wipe between light and dark... |
| Why I care about craft | Feb 1 2026 | 5 min read | A short essay on the kind of attention... |
| A quiet design system | Jan 1 2026 | 7 min read | On building component libraries that recede... |

For each: write body content using the Lexical editor (headings, paragraphs, etc.).

- [ ] **Step 3: Verify homepage shows content**

Open `http://localhost:3000`. You should see:
- Up to 6 work cards in the Work section
- Up to 4 posts in the Thoughts section

- [ ] **Step 4: Verify individual pages work**

Open any work detail page (e.g. `http://localhost:3000/work/storyxen`) and any thoughts detail page. Confirm body content renders, prev/next navigation works.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Payload CMS migration — Work and Posts now CMS-managed"
```

---

## Post-Migration Checklist

- [ ] Set real `BLOB_READ_WRITE_TOKEN` in Vercel environment variables (dashboard → Settings → Environment Variables)
- [ ] Re-upload cover images through Payload admin so they go to Vercel Blob (the ones currently in `public/portfolio/` won't break, but new uploads will use Blob)
- [ ] Add SEO meta fields to each work and post entry in the admin
- [ ] Test redirect creation in admin (Redirects collection → Create)
