import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { PrevNext } from '@/components/ui/PrevNext'
import type { Media } from '@/payload-types'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    limit: 100,
    depth: 0,
  })
  return docs.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const item = docs[0]
  if (!item) return { title: 'Thoughts' }

  const meta = item.meta as { title?: string; description?: string; image?: Media } | undefined

  return {
    title: meta?.title || item.title,
    description: meta?.description || item.excerpt,
  }
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function ThoughtDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs: allDocs } = await payload.find({
    collection: 'posts',
    sort: '-date',
    limit: 100,
    depth: 1,
  })

  const idx = allDocs.findIndex((p) => p.slug === slug)
  if (idx === -1) return notFound()

  const item = allDocs[idx]!
  const prev = allDocs[idx - 1]
  const next = allDocs[idx + 1]

  return (
    <PageShell>
      <BackHomeNav parent="/thoughts" />
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-3xl leading-tight">{item.title}</h1>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">
            {formatDate(item.date)} <span aria-hidden>•</span> {item.readTime}
          </p>
        </header>

        <div className="rich-text">
          <RichText data={item.body} />
        </div>
      </article>

      <PrevNext
        basePath="/thoughts"
        prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </PageShell>
  )
}
