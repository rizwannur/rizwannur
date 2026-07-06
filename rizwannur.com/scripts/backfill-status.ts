import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

// Backfill `_status` on legacy docs in versions-enabled collections.
// Payload synthesizes `_status` from the latest version in API output, but
// the persisted field can be missing on rows created before drafts were
// enabled — which leaks them past `_status: equals: 'published'` access
// filters when the filter also allows `exists: false`. Persisting the
// synthesized value closes the gap.

const collections = ['work', 'posts'] as const

const payload = await getPayload({ config })

let touched = 0
for (const collection of collections) {
  const { docs } = await payload.find({
    collection,
    where: { _status: { exists: false } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  for (const doc of docs as Array<{ id: string; slug?: string; _status?: string }>) {
    const status = (doc._status as 'draft' | 'published' | undefined) ?? 'draft'
    await payload.update({
      collection,
      id: doc.id,
      data: {},
      draft: status === 'draft',
      overrideAccess: true,
    })
    touched += 1
    console.log(`  ${collection}/${doc.slug ?? doc.id} → _status=${status}`)
  }
}

console.log(`Backfilled ${touched} doc(s).`)
process.exit(0)
