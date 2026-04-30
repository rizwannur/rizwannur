import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { PrevNext } from '@/components/ui/PrevNext'
import type { Craft } from '@/data/craft'
import type { Media } from '@/payload-types'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'craft', sort: 'order', limit: 0 })
  return docs.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'craft', where: { slug: { equals: slug } }, limit: 1 })
  return { title: docs[0]?.title ?? 'Craft' }
}

export default async function CraftDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs: allDocs } = await payload.find({ collection: 'craft', sort: 'order', limit: 0, depth: 1 })
  const idx = allDocs.findIndex((c) => c.slug === slug)
  if (idx === -1) return notFound()

  const doc = allDocs[idx]
  const item: Craft = {
    slug: doc.slug,
    title: doc.title,
    date: doc.date,
    description: doc.description,
    cover: typeof doc.cover === 'object' ? ((doc.cover as Media).url ?? undefined) : undefined,
    credit:
      doc.credit?.name
        ? { name: doc.credit.name, href: doc.credit.href ?? undefined }
        : undefined,
  }

  const prevDoc = allDocs[idx - 1]
  const nextDoc = allDocs[idx + 1]
  const prev = prevDoc ? { slug: prevDoc.slug, title: prevDoc.title } : undefined
  const next = nextDoc ? { slug: nextDoc.slug, title: nextDoc.title } : undefined

  return (
    <PageShell>
      <BackHomeNav parent="/craft" />
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-3xl leading-tight">{item.title}</h1>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">{item.date}</p>
        </header>
        <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{item.description}</p>
        <div className="relative aspect-[4/3] w-full rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center">
          <div className="text-neutral-400 dark:text-neutral-600 text-[13px]">Live demo placeholder</div>
        </div>
      </article>

      <PrevNext basePath="/craft" prev={prev} next={next} />
    </PageShell>
  )
}
