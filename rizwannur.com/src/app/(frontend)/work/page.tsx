import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { Footer } from '@/components/layout/Footer'
import { SearchInput } from '@/components/ui/SearchInput'
import type { Work } from '@/lib/types/work'
import type { Media } from '@/payload-types'
import { microlinkScreenshot } from '@/lib/microlink'
import { isDraftPreview } from '@/lib/preview-mode'

export const metadata = { title: 'Work — Rafey' }
export const revalidate = 60

import type { Work as PayloadWork } from '@/payload-types'

function toWorkItem(item: PayloadWork): Work {
  const coverMedia = typeof item.cover === 'object' && item.cover !== null ? (item.cover as Media) : null
  const uploadedUrl = coverMedia?.url ?? ''
  return {
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    cover: uploadedUrl || (item.href ? microlinkScreenshot(item.href) : ''),
    coverWidth: coverMedia?.width ?? undefined,
    coverHeight: coverMedia?.height ?? undefined,
    date: item.date,
    href: item.href ?? undefined,
    description: item.description,
    body: [],
  }
}

export default async function WorkIndex({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const payload = await getPayload({ config })

  const query = q?.trim()

  const showDrafts = await isDraftPreview()
  const baseWhere: Where | undefined = query
    ? {
        or: [
          { title: { like: query } },
          { subtitle: { like: query } },
          { description: { like: query } },
        ],
      }
    : undefined
  const where: Where | undefined = showDrafts
    ? baseWhere
    : baseWhere
      ? { and: [baseWhere, { _status: { equals: 'published' } }] }
      : { _status: { equals: 'published' } }
  const { docs } = await payload.find({
    collection: 'work',
    ...(where ? { where } : {}),
    sort: 'order',
    limit: 100,
    depth: 1,
    ...(showDrafts ? { overrideAccess: true, draft: true } : {}),
  })

  const workItems = docs.map(toWorkItem)

  return (
    <PageShell>
      <BackHomeNav />
      <section>
        <h1 className="font-display text-3xl mb-3">Work</h1>
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-8">
          Selected projects and case studies from my work in design and development.
        </p>
        <SearchInput
          defaultValue={query ?? ''}
          placeholder="Search projects..."
          resultCount={query ? workItems.length : undefined}
        />
        {workItems.length > 0 ? (
          <WorkGrid items={workItems} />
        ) : (
          <p className="text-[15px] text-neutral-500 dark:text-neutral-400 py-10 text-center">
            No projects found for &ldquo;{query}&rdquo;
          </p>
        )}
      </section>
      <Footer />
    </PageShell>
  )
}
