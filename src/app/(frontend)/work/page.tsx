import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { Footer } from '@/components/layout/Footer'
import type { Work } from '@/data/work'
import type { Media } from '@/payload-types'
import { microlinkScreenshot } from '@/lib/microlink'

export const metadata = { title: 'Work — Rafey' }

export default async function WorkIndex() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'work',
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  const workItems: Work[] = docs.map((item) => {
    const uploadedUrl = typeof item.cover === 'object' ? ((item.cover as Media).url ?? '') : ''
    const cover = uploadedUrl || (item.href ? microlinkScreenshot(item.href) : '')
    return {
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      cover,
      date: item.date,
      href: item.href ?? undefined,
      description: item.description,
      body: [],
    }
  })

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
