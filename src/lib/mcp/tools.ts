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
      const post = (await payload.create({
        collection: 'posts',
        overrideAccess: true,
        draft: false,
        data: {
          title,
          excerpt,
          readTime,
          date: date ?? new Date().toISOString(),
          ...(slug ? { slug } : {}),
          body: (await markdownToLexical(body)) as any,
        },
      } as any)) as any
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

      const post = (await payload.update({ collection: 'posts', id, overrideAccess: true, data })) as any
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
      const item = (await payload.create({
        collection: 'work',
        overrideAccess: true,
        draft: false,
        data: {
          title,
          subtitle,
          description,
          date,
          order: order ?? 99,
          ...(href ? { href } : {}),
          ...(slug ? { slug } : {}),
          body: (await markdownToLexical(body)) as any,
        },
      } as any)) as any
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
      if (body !== undefined) data.body = (await markdownToLexical(body)) as any

      const item = (await payload.update({ collection: 'work', id, overrideAccess: true, data })) as any
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
          ...(credit ? { credit } : {}),
        },
      } as any)) as any
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

      const item = (await payload.update({ collection: 'craft', id, overrideAccess: true, data })) as any
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
