import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { CraftGrid } from '@/components/sections/CraftGrid'
import { Footer } from '@/components/layout/Footer'
import type { Craft } from '@/lib/types/craft'
import type { Media } from '@/payload-types'

export const metadata = { title: 'Craft' }

export default async function CraftIndex() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'craft', sort: 'order', depth: 1 })

  const items: Craft[] = docs.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.date,
    description: item.description,
    cover: typeof item.cover === 'object' ? ((item.cover as Media).url ?? undefined) : undefined,
    credit:
      item.credit?.name
        ? { name: item.credit.name, href: item.credit.href ?? undefined }
        : undefined,
  }))

  return (
    <PageShell>
      <BackHomeNav />
      <section>
        <h1 className="font-display text-3xl mb-3">Craft</h1>
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-10">
          A collection of components and widgets exploring design, animations, and micro-interactions.
        </p>
        <CraftGrid items={items} />
      </section>
      <Footer />
    </PageShell>
  )
}
