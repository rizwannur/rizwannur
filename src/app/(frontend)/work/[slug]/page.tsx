import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { PrevNext } from '@/components/site/PrevNext'
import type { Media } from '@/payload-types'
import { microlinkScreenshot } from '@/lib/microlink'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'work',
    limit: 100,
    depth: 0,
  })
  return docs.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'work',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  const item = docs[0]
  if (!item) return { title: 'Work' }

  const uploadedUrl = typeof item.cover === 'object' ? ((item.cover as Media).url ?? '') : ''
  const coverUrl = uploadedUrl || (item.href ? microlinkScreenshot(item.href) : '')
  const meta = item.meta as { title?: string; description?: string; image?: Media } | undefined

  return {
    title: meta?.title || `${item.title} — ${item.subtitle}`,
    description: meta?.description || item.description,
    openGraph: {
      images: meta?.image?.url
        ? [{ url: meta.image.url }]
        : coverUrl
          ? [{ url: coverUrl }]
          : [],
    },
  }
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs: allDocs } = await payload.find({
    collection: 'work',
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  const idx = allDocs.findIndex((w) => w.slug === slug)
  if (idx === -1) return notFound()

  const item = allDocs[idx]!
  const prev = allDocs[idx - 1]
  const next = allDocs[idx + 1]

  const uploadedCoverUrl = typeof item.cover === 'object' ? ((item.cover as Media).url ?? '') : ''
  const coverUrl = uploadedCoverUrl || (item.href ? microlinkScreenshot(item.href) : '')

  const galleryImages =
    item.images?.map((img) => ({
      src: typeof img.image === 'object' ? ((img.image as Media).url ?? '') : '',
      caption: img.caption ?? undefined,
    })) ?? []

  return (
    <PageShell>
      <BackHomeNav parent="/work" />
      <article className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">{item.title}</h1>
            <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">
              {item.subtitle} <span aria-hidden>•</span> {item.date}
            </p>
          </div>
          {item.href && (
            <Link
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/8 dark:hover:bg-white/15 transition-colors px-3 h-8 text-[13px]"
            >
              <ExternalLink className="size-3.5" />
              View work
            </Link>
          )}
        </div>

        <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {item.description}
        </p>

        {coverUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-black/5 dark:bg-white/5">
            <Image
              src={coverUrl}
              alt={`${item.title} cover image`}
              fill
              sizes="669px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="rich-text">
          <RichText data={item.body} />
        </div>

        {galleryImages.map((img, i) => (
          <figure key={i} className="flex flex-col gap-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
              <Image src={img.src} alt={img.caption ?? ''} fill sizes="669px" className="object-cover" />
            </div>
            {img.caption && (
              <figcaption className="text-center text-[13px] text-neutral-500 dark:text-neutral-400">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </article>

      <PrevNext
        basePath="/work"
        prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </PageShell>
  )
}
