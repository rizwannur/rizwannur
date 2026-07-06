# Payload CMS MCP Server — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hosted MCP server inside the Next.js app exposing 16 tools for full CRUD on posts, work, and craft, plus media listing — secured with a static bearer token.

**Architecture:** `mcp-handler` mounts at `app/api/[transport]/route.ts`. All tools live in `src/lib/mcp/tools.ts`. A thin auth wrapper checks `Authorization: Bearer <MCP_SECRET>` before every request. Markdown ↔ Lexical conversion is handled by `src/lib/mcp/lexical.ts` using Payload's built-in `editorConfigFactory`.

**Tech Stack:** `mcp-handler`, `@modelcontextprotocol/sdk`, `zod`, `@payloadcms/richtext-lexical` (already installed), Payload local API

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/mcp/lexical.ts` | Create | Markdown ↔ Lexical conversion helpers (async, lazily initialised) |
| `src/lib/mcp/tools.ts` | Create | All 16 MCP tool definitions using Payload local API |
| `src/app/api/[transport]/route.ts` | Create | Auth wrapper + `createMcpHandler` wiring |
| `.env.local` | Modify | Add `MCP_SECRET` |

---

## Task 1: Install dependencies and regenerate Payload types

**Files:**
- Modify: `package.json` (via bun)
- Modify: `src/payload-types.ts` (via payload generate:types)

- [ ] **Step 1: Install mcp-handler and its peer dependencies**

```bash
bun add mcp-handler @modelcontextprotocol/sdk zod
```

Expected: `package.json` updated, `bun.lockb` updated, no errors.

- [ ] **Step 2: Regenerate Payload types (Craft collection was added earlier and types are stale)**

```bash
bun run payload generate:types
```

Expected: `src/payload-types.ts` regenerated. It should now include a `Craft` interface with fields: `id`, `title`, `slug`, `date`, `description`, `cover`, `credit`, `order`.

- [ ] **Step 3: Verify TypeScript is still happy**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lockb src/payload-types.ts
git commit -m "chore: add mcp-handler deps, regenerate payload types"
```

---

## Task 2: Create Markdown ↔ Lexical conversion helpers

The Posts and Work collections use Payload's Lexical rich text editor internally. AI agents write Markdown. This module bridges the two.

**Files:**
- Create: `src/lib/mcp/lexical.ts`

- [ ] **Step 1: Create `src/lib/mcp/lexical.ts`**

```ts
import {
  convertMarkdownToLexical,
  convertLexicalToMarkdown,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import payloadConfig from '@payload-config'

type EditorConfig = Awaited<ReturnType<typeof editorConfigFactory.default>>

let cachedConfig: EditorConfig | null = null

async function getEditorConfig(): Promise<EditorConfig> {
  if (!cachedConfig) {
    cachedConfig = await editorConfigFactory.default({ config: payloadConfig })
  }
  return cachedConfig
}

export async function markdownToLexical(markdown: string): Promise<SerializedEditorState> {
  const editorConfig = await getEditorConfig()
  return convertMarkdownToLexical({ markdown, editorConfig })
}

export async function lexicalToMarkdown(data: unknown): Promise<string> {
  if (!data) return ''
  const editorConfig = await getEditorConfig()
  return convertLexicalToMarkdown({
    data: data as SerializedEditorState,
    editorConfig,
  })
}
```

- [ ] **Step 2: Check types compile**

```bash
bun run type-check
```

Expected: no errors from `src/lib/mcp/lexical.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/lexical.ts
git commit -m "feat: add Lexical <-> Markdown conversion helpers"
```

---

## Task 3: Create the tools module

All 16 tools in one file, grouped by collection. Each tool has a detailed description so any AI agent can understand what it does and when to use it without extra context.

**Files:**
- Create: `src/lib/mcp/tools.ts`

- [ ] **Step 1: Create `src/lib/mcp/tools.ts`**

```ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { markdownToLexical, lexicalToMarkdown } from './lexical'

// McpServer type is inferred from mcp-handler — no explicit import needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerTools(server: any) {
  const payload = await getPayload({ config })

  // ─── POSTS ──────────────────────────────────────────────────────────────

  server.registerTool(
    'list_posts',
    {
      title: 'List Posts',
      description:
        'List all blog posts sorted newest-first. Returns id, slug, title, date, readTime, excerpt — body is excluded (too large). Use this to browse existing posts, find an id before editing, or check for duplicates before creating a new post.',
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20).describe('Max results to return (default 20)'),
        page: z.number().int().min(1).default(1).describe('Page number for pagination (default 1)'),
      },
    },
    async ({ limit, page }: { limit: number; page: number }) => {
      const { docs, totalDocs } = await payload.find({
        collection: 'posts',
        sort: '-date',
        limit,
        page,
        depth: 0,
        overrideAccess: true,
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
                  id: p.id,
                  slug: p.slug,
                  title: p.title,
                  date: p.date,
                  readTime: p.readTime,
                  excerpt: p.excerpt,
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
        'Fetch the full content of a single blog post including the body returned as Markdown. Always call this before editing — read the current body first, then call update_post with your changes.',
      inputSchema: {
        slug: z.string().describe('The post slug, e.g. "my-first-post". Get slugs from list_posts.'),
      },
    },
    async ({ slug }: { slug: string }) => {
      const { docs } = await payload.find({
        collection: 'posts',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (!docs[0]) {
        return { content: [{ type: 'text' as const, text: `Post with slug "${slug}" not found. Use list_posts to see available slugs.` }] }
      }
      const p: any = docs[0]
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                id: p.id,
                slug: p.slug,
                title: p.title,
                date: p.date,
                readTime: p.readTime,
                excerpt: p.excerpt,
                body: await lexicalToMarkdown(p.body),
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
      title: 'Create Post',
      description:
        'Publish a new blog post. Write body as Markdown — headings (## for h2, ### for h3), **bold**, *italic*, [links](url), - bullet lists, 1. numbered lists, and ```code blocks``` are all supported. Estimate readTime from word count (e.g. "5 min read" for ~1250 words). slug is auto-generated from title if omitted. date defaults to today if omitted.',
      inputSchema: {
        title: z.string().describe('Post title'),
        excerpt: z.string().describe('1–2 sentence summary shown on the index page and homepage preview'),
        body: z.string().describe('Full post content written in Markdown'),
        readTime: z.string().describe('Estimated read time, e.g. "5 min read"'),
        date: z.string().optional().describe('ISO date string e.g. "2026-04-30T00:00:00.000Z". Defaults to today.'),
        slug: z.string().optional().describe('URL-safe slug e.g. "my-post-title". Auto-generated from title if omitted.'),
      },
    },
    async ({ title, excerpt, body, readTime, date, slug }: any) => {
      const post = await payload.create({
        collection: 'posts',
        overrideAccess: true,
        data: {
          title,
          excerpt,
          readTime,
          date: date ?? new Date().toISOString(),
          ...(slug ? { slug } : {}),
          body: await markdownToLexical(body),
        },
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: post.id, slug: post.slug, title: post.title }, null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'update_post',
    {
      title: 'Update Post',
      description:
        'Update an existing blog post by id. Only the fields you include are changed — omit anything you want to leave untouched. Pass body as Markdown if updating content. Get the id from list_posts first.',
      inputSchema: {
        id: z.string().describe('Post id — get this from list_posts'),
        title: z.string().optional().describe('New title'),
        excerpt: z.string().optional().describe('New excerpt'),
        body: z.string().optional().describe('Updated body written in Markdown'),
        readTime: z.string().optional().describe('Updated read time e.g. "6 min read"'),
        date: z.string().optional().describe('Updated ISO date string'),
      },
    },
    async ({ id, title, excerpt, body, readTime, date }: any) => {
      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (excerpt !== undefined) data.excerpt = excerpt
      if (readTime !== undefined) data.readTime = readTime
      if (date !== undefined) data.date = date
      if (body !== undefined) data.body = await markdownToLexical(body)

      const post = await payload.update({ collection: 'posts', id, overrideAccess: true, data })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: post.id, slug: post.slug, title: post.title }, null, 2),
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
        'Permanently delete a blog post by id. This cannot be undone. Confirm the correct post via list_posts before calling.',
      inputSchema: {
        id: z.string().describe('Post id — get this from list_posts'),
      },
    },
    async ({ id }: { id: string }) => {
      await payload.delete({ collection: 'posts', id, overrideAccess: true })
      return { content: [{ type: 'text' as const, text: `Post ${id} permanently deleted.` }] }
    },
  )

  // ─── WORK ───────────────────────────────────────────────────────────────

  server.registerTool(
    'list_work',
    {
      title: 'List Work',
      description:
        'List all work/project items sorted by display order ascending (lower order = higher on the page). Returns id, slug, title, subtitle, description, date, href, order. Use this to browse projects, find ids before editing, or check existing order values before adding a new item.',
      inputSchema: {},
    },
    async () => {
      const { docs } = await payload.find({
        collection: 'work',
        sort: 'order',
        limit: 100,
        depth: 0,
        overrideAccess: true,
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              docs.map((w: any) => ({
                id: w.id,
                slug: w.slug,
                title: w.title,
                subtitle: w.subtitle,
                description: w.description,
                date: w.date,
                href: w.href,
                order: w.order,
              })),
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
        'Fetch full details of a single work item including the body writeup returned as Markdown. Call this before editing — read the current body first, then call update_work with your changes.',
      inputSchema: {
        slug: z.string().describe('Work item slug. Get slugs from list_work.'),
      },
    },
    async ({ slug }: { slug: string }) => {
      const { docs } = await payload.find({
        collection: 'work',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (!docs[0]) {
        return { content: [{ type: 'text' as const, text: `Work item with slug "${slug}" not found. Use list_work to see available slugs.` }] }
      }
      const w: any = docs[0]
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                id: w.id,
                slug: w.slug,
                title: w.title,
                subtitle: w.subtitle,
                description: w.description,
                date: w.date,
                href: w.href,
                order: w.order,
                body: await lexicalToMarkdown(w.body),
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
      title: 'Create Work Item',
      description:
        'Add a new project to the work section. subtitle is a short type descriptor like "Marketing Website" or "iOS App". description is the one-liner shown on project cards — keep it to ~15 words. body is the full project writeup in Markdown. href is the live site URL. order controls position — lower = higher on the page; call list_work first to see existing order values and pick a sensible number.',
      inputSchema: {
        title: z.string().describe('Project title'),
        subtitle: z.string().describe('Short type descriptor e.g. "Marketing Website", "iOS App", "Brand Identity"'),
        description: z.string().describe('One-liner shown on project cards, ~15 words max'),
        body: z.string().describe('Full project writeup in Markdown'),
        date: z.string().describe('Display date string e.g. "Mar 2026"'),
        order: z.number().int().optional().describe('Display order — lower = higher on page. Default 99. Check list_work for existing values.'),
        href: z.string().optional().describe('Live site URL e.g. "https://example.com"'),
        slug: z.string().optional().describe('URL slug. Auto-generated from title if omitted.'),
      },
    },
    async ({ title, subtitle, description, body, date, order, href, slug }: any) => {
      const item = await payload.create({
        collection: 'work',
        overrideAccess: true,
        data: {
          title,
          subtitle,
          description,
          date,
          order: order ?? 99,
          ...(href ? { href } : {}),
          ...(slug ? { slug } : {}),
          body: await markdownToLexical(body),
        },
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: item.id, slug: item.slug, title: item.title }, null, 2),
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
        'Update an existing work item by id. Only fields you provide are changed — omit anything to leave it untouched. Pass body as Markdown to update the writeup. Get the id from list_work first.',
      inputSchema: {
        id: z.string().describe('Work item id — get this from list_work'),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        body: z.string().optional().describe('Updated writeup in Markdown'),
        date: z.string().optional(),
        order: z.number().int().optional(),
        href: z.string().optional(),
      },
    },
    async ({ id, title, subtitle, description, body, date, order, href }: any) => {
      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (subtitle !== undefined) data.subtitle = subtitle
      if (description !== undefined) data.description = description
      if (date !== undefined) data.date = date
      if (order !== undefined) data.order = order
      if (href !== undefined) data.href = href
      if (body !== undefined) data.body = await markdownToLexical(body)

      const item = await payload.update({ collection: 'work', id, overrideAccess: true, data })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: item.id, slug: item.slug, title: item.title }, null, 2),
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

  // ─── CRAFT ──────────────────────────────────────────────────────────────

  server.registerTool(
    'list_craft',
    {
      title: 'List Craft',
      description:
        'List all craft items (small UI experiments — components, animations, micro-interactions) sorted by display order ascending. Returns id, slug, title, date, description, order. Use to browse items or find an id before editing.',
      inputSchema: {},
    },
    async () => {
      const { docs } = await payload.find({
        collection: 'craft',
        sort: 'order',
        limit: 100,
        depth: 0,
        overrideAccess: true,
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              docs.map((c: any) => ({
                id: c.id,
                slug: c.slug,
                title: c.title,
                date: c.date,
                description: c.description,
                order: c.order,
              })),
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
        'Fetch full details of a single craft item including credit attribution if set.',
      inputSchema: {
        slug: z.string().describe('Craft item slug. Get slugs from list_craft.'),
      },
    },
    async ({ slug }: { slug: string }) => {
      const { docs } = await payload.find({
        collection: 'craft',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (!docs[0]) {
        return { content: [{ type: 'text' as const, text: `Craft item with slug "${slug}" not found. Use list_craft to see available slugs.` }] }
      }
      const c: any = docs[0]
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                id: c.id,
                slug: c.slug,
                title: c.title,
                date: c.date,
                description: c.description,
                order: c.order,
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
        'Add a new craft item. These are small focused UI experiments — keep description to one punchy sentence that describes what makes it interesting. order controls position on the page — call list_craft first to see existing order values.',
      inputSchema: {
        title: z.string().describe('Craft item title e.g. "Magnetic Button"'),
        description: z.string().describe('One punchy sentence describing the experiment e.g. "A button that pulls the cursor toward it with a subtle magnetic effect."'),
        date: z.string().describe('Display date string e.g. "Apr 2026"'),
        order: z.number().int().optional().describe('Display order — lower = higher on page. Default 99. Check list_craft for existing values.'),
        slug: z.string().optional().describe('URL slug. Auto-generated from title if omitted.'),
        credit: z
          .object({
            name: z.string().describe('Name of the person or source to credit'),
            href: z.string().optional().describe('Optional link for the credit'),
          })
          .optional()
          .describe('Optional attribution if the experiment is inspired by or based on someone else\'s work'),
      },
    },
    async ({ title, description, date, order, slug, credit }: any) => {
      const item = await payload.create({
        collection: 'craft',
        overrideAccess: true,
        data: {
          title,
          description,
          date,
          order: order ?? 99,
          ...(slug ? { slug } : {}),
          ...(credit ? { credit } : {}),
        },
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: item.id, slug: item.slug, title: item.title }, null, 2),
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
        'Update an existing craft item by id. Only fields you provide are changed — omit anything to leave it untouched. Get the id from list_craft first.',
      inputSchema: {
        id: z.string().describe('Craft item id — get this from list_craft'),
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        order: z.number().int().optional(),
        credit: z
          .object({
            name: z.string(),
            href: z.string().optional(),
          })
          .optional(),
      },
    },
    async ({ id, title, description, date, order, credit }: any) => {
      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (description !== undefined) data.description = description
      if (date !== undefined) data.date = date
      if (order !== undefined) data.order = order
      if (credit !== undefined) data.credit = credit

      const item = await payload.update({ collection: 'craft', id, overrideAccess: true, data })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: item.id, slug: item.slug, title: item.title }, null, 2),
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
        'Permanently delete a craft item by id. This cannot be undone. Confirm the correct item via list_craft before calling.',
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
    'list_media',
    {
      title: 'List Media',
      description:
        'List all uploaded media files. Returns id, filename, url, alt, mimeType for each file. Use the id when you want to assign a cover image to a work or craft item — pass it as the cover field in update_work or update_craft.',
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20).describe('Max results (default 20)'),
      },
    },
    async ({ limit }: { limit: number }) => {
      const { docs } = await payload.find({
        collection: 'media',
        limit,
        depth: 0,
        overrideAccess: true,
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              docs.map((m: any) => ({
                id: m.id,
                filename: m.filename,
                url: m.url,
                alt: m.alt,
                mimeType: m.mimeType,
              })),
              null,
              2,
            ),
          },
        ],
      }
    },
  )
}
```

- [ ] **Step 2: Run type-check**

```bash
bun run type-check
```

Expected: no errors from `src/lib/mcp/tools.ts`. If there are `any` type warnings but no errors, that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mcp/tools.ts
git commit -m "feat: add MCP tools module — 16 tools for posts, work, craft, media"
```

---

## Task 4: Create the route handler

**Files:**
- Create: `src/app/api/[transport]/route.ts`

- [ ] **Step 1: Create `src/app/api/[transport]/route.ts`**

```ts
import { createMcpHandler } from 'mcp-handler'
import { registerTools } from '@/lib/mcp/tools'

const mcpHandler = createMcpHandler(
  async (server) => {
    await registerTools(server)
  },
  {},
  { basePath: '/api' },
)

function withAuth(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
    if (!token || token !== process.env.MCP_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
    return handler(req)
  }
}

export const GET = withAuth(mcpHandler)
export const POST = withAuth(mcpHandler)
```

- [ ] **Step 2: Run type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/[transport]/route.ts
git commit -m "feat: add MCP server route with bearer token auth"
```

---

## Task 5: Add MCP_SECRET and smoke test

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Check .gitignore has .env.local**

```bash
grep ".env.local" .gitignore
```

Expected: line found. If missing, run: `echo ".env.local" >> .gitignore && git add .gitignore && git commit -m "chore: gitignore .env.local"`

- [ ] **Step 2: Generate a secret token**

```bash
openssl rand -hex 32
```

Copy the output. It will look like `a3f8e2b1c4d5e6f7a3f8e2b1c4d5e6f7a3f8e2b1c4d5e6f7a3f8e2b1c4d5e6f7`.

- [ ] **Step 3: Add MCP_SECRET to .env.local**

Open `.env.local` and add:
```
MCP_SECRET=<paste your generated token here>
```

- [ ] **Step 4: Start the dev server**

```bash
bun dev
```

Wait for `✓ Ready` or `ready - started server on`.

- [ ] **Step 5: Verify auth rejection (no token)**

In a new terminal:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/mcp
```

Expected output: `401`

- [ ] **Step 6: Verify tool list returns 16 tools**

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $(grep MCP_SECRET .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('Tool count:', d.result?.tools?.length); d.result?.tools?.forEach(t => console.log(' -', t.name))"
```

Expected: `Tool count: 16` followed by all 16 tool names.

- [ ] **Step 7: Test list_posts tool**

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $(grep MCP_SECRET .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_posts","arguments":{"limit":5}}}' | \
  node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(JSON.stringify(d.result, null, 2))"
```

Expected: JSON response with `content` array containing post data (may be an empty list if no posts exist yet — that's fine).

- [ ] **Step 8: Test list_work tool**

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $(grep MCP_SECRET .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_work","arguments":{}}}' | \
  node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(JSON.stringify(d.result, null, 2))"
```

Expected: JSON response listing your work items.

- [ ] **Step 9: Add MCP_SECRET to Vercel environment variables**

Go to Vercel project settings → Environment Variables → add:
- Key: `MCP_SECRET`
- Value: same token from Step 2
- Environments: Production, Preview, Development

- [ ] **Step 10: Commit smoke test passing**

```bash
git commit --allow-empty -m "chore: MCP server smoke tested — 16 tools, auth working"
```

---

## How to Connect AI Agents

Once deployed to Vercel, add this to any AI agent's MCP config:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):
```json
{
  "mcpServers": {
    "rizwannur": {
      "url": "https://rizwannur.xyz/api/mcp",
      "headers": {
        "Authorization": "Bearer <your MCP_SECRET>"
      }
    }
  }
}
```

**Claude Code** (for local dev, add to `.claude/settings.json`):
```json
{
  "mcpServers": {
    "rizwannur-local": {
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer <your MCP_SECRET>"
      }
    }
  }
}
```
