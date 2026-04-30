import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { Footer } from '@/components/layout/Footer'
import { SearchInput } from '@/components/ui/SearchInput'
import type { Work } from '@/lib/types/work'
import type { Media } from '@/payload-types'
import { microlinkScreenshot } from '@/lib/microlink'

export const metadata = { title: 'Work — Rafey' }

import type { Work as PayloadWork } from '@/payload-types'

function toWorkItem(item: PayloadWork): Work {
  const uploadedUrl = typeof item.cover === 'object' && item.cover !== null ? ((item.cover as Media).url ?? '') : ''
  return {
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    cover: uploadedUrl || (item.href ? microlinkScreenshot(item.href) : ''),
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

  const { docs } = await payload.find({
    collection: 'work',
    ...(query
      ? {
          where: {
            or: [
              { title: { like: query } },
              { subtitle: { like: query } },
              { description: { like: query } },
            ],
          },
        }
      : {}),
    sort: 'order',
    limit: 100,
    depth: 1,
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
