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
    'NOTE: post URLs use the path `/thoughts/{slug}` (NOT `/blog/{slug}`). Use this exact path when linking.',
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
