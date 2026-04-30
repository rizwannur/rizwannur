import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, lexicalToMarkdown } from '@/lib/mcp/lexical'

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'posts',
  limit: 100,
  depth: 0,
  overrideAccess: true,
})

let updated = 0
let skipped = 0

for (const post of docs) {
  const markdown = await lexicalToMarkdown(post.body, { collection: 'posts', field: 'body' })
  if (!/```/.test(markdown)) {
    skipped += 1
    continue
  }
  const newBody = await markdownToLexical(markdown, { collection: 'posts', field: 'body' })
  const root = newBody.root as unknown as { children: { type: string }[] }
  const hasBlock = root.children.some((c) => c.type === 'block')
  if (!hasBlock) {
    console.log(`  - ${post.slug}: had \`\`\` in markdown but no block produced — skipping`)
    skipped += 1
    continue
  }
  await payload.update({
    collection: 'posts',
    id: post.id,
    data: { body: newBody as unknown as Record<string, unknown> },
    overrideAccess: true,
  })
  console.log(`  ✓ ${post.slug}`)
  updated += 1
}

console.log(`\nUpdated ${updated}, skipped ${skipped}.`)

export {}
