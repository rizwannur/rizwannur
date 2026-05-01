import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { markdownToLexical, lexicalToMarkdown, substituteInlinePlaceholders } from './lexical'
import { generateImage } from './imagegen'
import { checkSeo } from './validators/seo'
import { suggestInternalLinks } from './internal-links'
import { buildPreviewUrl } from './preview'
import { validateInlineImages, formatInlineValidationError } from './validators/inline-images'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mediaRef(m: any): { id: string; url: string; alt: string | null } | null {
  if (!m || typeof m !== 'object') return null
  return { id: m.id, url: m.url, alt: m.alt ?? null }
}

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
        search: z.string().optional().describe('Case-insensitive substring match against title and excerpt'),
        from: z.string().optional().describe('ISO date — only include posts on or after this date'),
        to: z.string().optional().describe('ISO date — only include posts on or before this date'),
        tag: z.string().optional().describe('Filter by tag (exact match)'),
      },
    },
    async ({ limit, page, search, from, to, tag }: { limit: number; page: number; search?: string; from?: string; to?: string; tag?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}
      if (search) where.or = [{ title: { contains: search } }, { excerpt: { contains: search } }]
      if (from || to) {
        where.date = {}
        if (from) where.date.greater_than_equal = from
        if (to) where.date.less_than_equal = to
      }
      if (tag) where.tags = { contains: tag }
      const { docs, totalDocs } = await payload.find({
        collection: 'posts',
        sort: '-date',
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
                posts: docs.map((p: any) => ({
                  id: p.id,
                  slug: p.slug,
                  title: p.title,
                  date: p.date,
                  readTime: p.readTime,
                  excerpt: p.excerpt,
                  tags: p.tags ?? [],
                  coverImage: mediaRef(p.coverImage),
                  status: p._status ?? 'published',
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
        depth: 1,
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
                tags: p.tags ?? [],
                coverImage: mediaRef(p.coverImage),
                status: p._status ?? 'published',
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
        tags: z.array(z.string()).optional().describe('Topic tags e.g. ["nextjs","performance"]'),
        coverImage: z.number().int().optional().describe('Media file id for the post cover image — get ids from list_media.'),
        status: z.enum(['draft', 'published']).optional().describe('Defaults to "published". Use "draft" to save without publishing.'),
        seo: z
          .object({
            title: z.string().optional().describe('SEO meta title — defaults to post title if omitted'),
            description: z.string().optional().describe('SEO meta description — defaults to excerpt if omitted'),
            image: z.number().int().optional().describe('Media id for OG/Twitter image — defaults to coverImage if omitted'),
          })
          .optional()
          .describe('Optional SEO overrides for meta tags and social cards'),
      },
    },
    async ({ title, excerpt, body, readTime, date, slug, tags, coverImage, status, seo }: any) => {
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
          body: (await markdownToLexical(body, { collection: 'posts', field: 'body' })) as any,
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
        tags: z.array(z.string()).optional().describe('Replace tags with this list. Pass [] to clear.'),
        coverImage: z.number().int().nullable().optional().describe('Media id for cover image. Pass null to clear.'),
        status: z.enum(['draft', 'published']).optional().describe('Switch between draft and published'),
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
    async ({ id, title, excerpt, body, readTime, date, tags, coverImage, status, seo }: any) => {
      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (excerpt !== undefined) data.excerpt = excerpt
      if (readTime !== undefined) data.readTime = readTime
      if (date !== undefined) data.date = date
      if (tags !== undefined) data.tags = tags
      if (coverImage !== undefined) data.coverImage = coverImage
      if (body !== undefined) data.body = await markdownToLexical(body, { collection: 'posts', field: 'body' })
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
        'List work/project items sorted by display order ascending (lower order = higher on the page). Returns id, slug, title, subtitle, description, date, href, order, cover, tech. Supports search and pagination. Use this to browse projects, find ids before editing, or check existing order values before adding a new item.',
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(50).describe('Max results to return (default 50)'),
        page: z.number().int().min(1).default(1).describe('Page number (default 1)'),
        search: z.string().optional().describe('Case-insensitive substring match against title, subtitle, description'),
        tech: z.string().optional().describe('Filter by tech stack entry (exact match)'),
      },
    },
    async ({ limit, page, search, tech }: { limit: number; page: number; search?: string; tech?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}
      if (search) where.or = [
        { title: { contains: search } },
        { subtitle: { contains: search } },
        { description: { contains: search } },
      ]
      if (tech) where.tech = { contains: tech }
      const { docs, totalDocs } = await payload.find({
        collection: 'work',
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
                items: docs.map((w: any) => ({
                  id: w.id,
                  slug: w.slug,
                  title: w.title,
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
        depth: 1,
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
      title: 'Create Work Item',
      description:
        'Add a new project to the work section. subtitle is a short type descriptor like "Marketing Website" or "iOS App". description is the one-liner shown on project cards — keep it to ~15 words. body is the full project writeup in Markdown. href is the live site URL. order controls position — lower = higher on the page; call list_work first to see existing order values and pick a sensible number. cover is a media file id from list_media. Gallery images (images field) must be managed through the Payload admin UI.',
      inputSchema: {
        title: z.string().describe('Project title'),
        subtitle: z.string().describe('Short type descriptor e.g. "Marketing Website", "iOS App", "Brand Identity"'),
        description: z.string().describe('One-liner shown on project cards, ~15 words max'),
        body: z.string().describe('Full project writeup in Markdown'),
        date: z.string().describe('Display date string e.g. "Mar 2026"'),
        order: z.number().int().optional().describe('Display order — lower = higher on page. Default 99. Check list_work for existing values.'),
        href: z.string().optional().describe('Live site URL e.g. "https://example.com"'),
        slug: z.string().optional().describe('URL slug. Auto-generated from title if omitted.'),
        cover: z.number().int().optional().describe('Media file id for the cover image — get ids from list_media.'),
        tech: z.array(z.string()).optional().describe('Tech stack entries e.g. ["Next.js","Tailwind"]'),
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
    async ({ title, subtitle, description, body, date, order, href, slug, cover, tech, seo }: any) => {
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
        'Update an existing work item by id. Only fields you provide are changed — omit anything to leave it untouched. Pass body as Markdown to update the writeup. Pass a media file id as cover to set the cover image. Get the id from list_work first. Gallery images (images field) must be managed through the Payload admin UI.',
      inputSchema: {
        id: z.string().describe('Work item id — get this from list_work'),
        title: z.string().optional().describe('Updated project title'),
        subtitle: z.string().optional().describe('Updated subtitle e.g. "Marketing Website"'),
        description: z.string().optional().describe('Updated one-liner for project cards'),
        body: z.string().optional().describe('Updated writeup in Markdown'),
        date: z.string().optional().describe('Updated display date e.g. "Mar 2026"'),
        order: z.number().int().optional().describe('Updated display order — lower = higher on page'),
        href: z.string().optional().describe('Updated live site URL'),
        cover: z.number().int().nullable().optional().describe('Media file id for the cover image. Pass null to clear.'),
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
    async ({ id, title, subtitle, description, body, date, order, href, cover, tech, seo }: any) => {
      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (subtitle !== undefined) data.subtitle = subtitle
      if (description !== undefined) data.description = description
      if (date !== undefined) data.date = date
      if (order !== undefined) data.order = order
      if (href !== undefined) data.href = href
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

  server.registerTool(
    'set_work_images',
    {
      title: 'Set Work Gallery',
      description:
        'Replace the gallery images on a work item. Pass an array of {mediaId, caption?} in display order. Empty array clears the gallery. Atomic replace — existing entries are dropped. Use list_media to get mediaIds.',
      inputSchema: {
        id: z.string().describe('Work item id — get this from list_work'),
        images: z
          .array(
            z.object({
              mediaId: z.string().describe('Media file id'),
              caption: z.string().optional().describe('Optional caption shown beneath the image'),
            }),
          )
          .describe('Ordered list of gallery images. Pass [] to clear.'),
      },
    },
    async ({ id, images }: { id: string; images: { mediaId: string; caption?: string }[] }) => {
      const item = (await payload.update({
        collection: 'work',
        id,
        overrideAccess: true,
        data: {
          images: images.map(({ mediaId, caption }) => ({
            image: mediaId,
            ...(caption !== undefined ? { caption } : {}),
          })),
        },
      })) as any
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ id: item.id, slug: item.slug, count: item.images?.length ?? 0 }, null, 2),
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
        'List craft items (small UI experiments — components, animations, micro-interactions) sorted by display order ascending. Returns id, slug, title, date, description, order, cover, tags. Supports search and pagination. Use to browse items or find an id before editing.',
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
                  id: c.id,
                  slug: c.slug,
                  title: c.title,
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
        depth: 1,
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
        'Add a new craft item. These are small focused UI experiments — keep description to one punchy sentence that describes what makes it interesting. order controls position on the page — call list_craft first to see existing order values. cover is a media file id from list_media.',
      inputSchema: {
        title: z.string().describe('Craft item title e.g. "Magnetic Button"'),
        description: z.string().describe('One punchy sentence describing the experiment e.g. "A button that pulls the cursor toward it with a subtle magnetic effect."'),
        date: z.string().describe('Display date string e.g. "Apr 2026"'),
        order: z.number().int().optional().describe('Display order — lower = higher on page. Default 99. Check list_craft for existing values.'),
        slug: z.string().optional().describe('URL slug. Auto-generated from title if omitted.'),
        cover: z.number().int().optional().describe('Media file id for the cover image — get ids from list_media.'),
        tags: z.array(z.string()).optional().describe('Topic tags e.g. ["animation","button"]'),
        credit: z
          .object({
            name: z.string().describe('Name of the person or source to credit'),
            href: z.string().optional().describe('Optional link for the credit'),
          })
          .optional()
          .describe('Optional attribution if the experiment is inspired by or based on someone else\'s work'),
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
        'Update an existing craft item by id. Only fields you provide are changed — omit anything to leave it untouched. Pass a media file id as cover to set the cover image. Get the id from list_craft first.',
      inputSchema: {
        id: z.string().describe('Craft item id — get this from list_craft'),
        title: z.string().optional().describe('Updated title'),
        description: z.string().optional().describe('Updated one-sentence description'),
        date: z.string().optional().describe('Updated display date e.g. "Apr 2026"'),
        order: z.number().int().optional().describe('Updated display order — lower = higher on page'),
        cover: z.number().int().nullable().optional().describe('Media file id for the cover image. Pass null to clear.'),
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
    async ({ id, title, description, date, order, cover, tags, credit }: any) => {
      const data: Record<string, unknown> = {}
      if (title !== undefined) data.title = title
      if (description !== undefined) data.description = description
      if (date !== undefined) data.date = date
      if (order !== undefined) data.order = order
      if (cover !== undefined) data.cover = cover
      if (tags !== undefined) data.tags = tags
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
    'upload_media',
    {
      title: 'Upload Media from URL',
      description:
        'Download an image from a public URL and upload it to the Payload media library. Returns the media id, filename, and url. Use the id as a cover field in create_work / update_work / create_craft / update_craft, or embed it in post/work body content using the syntax ![media:<id>](). Supports JPEG, PNG, WebP, GIF, SVG. The URL must be publicly accessible.',
      inputSchema: {
        url: z.string().url().describe('Public URL of the image to download and upload e.g. "https://example.com/image.jpg"'),
        alt: z.string().optional().describe('Alt text for the image, used for accessibility and SEO'),
        filename: z.string().optional().describe('Filename to save as e.g. "my-image.jpg". Auto-detected from the URL if omitted.'),
      },
    },
    async ({ url, alt, filename }: any) => {
      const response = await fetch(url)
      if (!response.ok) {
        return { content: [{ type: 'text' as const, text: `Failed to fetch image from URL: ${response.status} ${response.statusText}` }] }
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg'
      const buffer = await response.arrayBuffer()
      const name = filename || url.split('/').pop()?.split('?')[0] || 'image.jpg'

      const media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: { alt: alt ?? '' },
        file: {
          data: Buffer.from(buffer),
          mimetype: contentType,
          name,
          size: buffer.byteLength,
        },
      })

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                id: (media as any).id,
                filename: (media as any).filename,
                url: (media as any).url,
                hint: `Use as cover: pass id as cover field. Embed in body: ![media:${(media as any).id}]()`,
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
        'List uploaded media files. Returns id, filename, url, alt, mimeType, width, height, filesize, createdAt, updatedAt. Sorted newest-first. Supports search by filename/alt and pagination. Use the id as a cover field in create_work / update_work / create_craft / update_craft, or embed in body using ![media:<id>](). To upload a new image from a URL, use upload_media instead.',
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
}
