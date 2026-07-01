import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { PrevNext } from '@/components/ui/PrevNext'
import type { Media } from '@/payload-types'
import { microlinkScreenshot } from '@/lib/microlink'
import { buildPageMetadata } from '@/lib/page-metadata'
import { isDraftPreview } from '@/lib/preview-mode'

export const revalidate = 60
export const dynamicParams = true

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

  const meta = item.meta as
    | { title?: string; description?: string; image?: Media | string }
    | undefined

  return buildPageMetadata({
    title: `${item.title} — ${item.subtitle}`,
    description: item.description,
    path: `/work/${slug}`,
    type: 'article',
    meta,
    tags: (item.tech as string[] | undefined) ?? [],
  })
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const showDrafts = await isDraftPreview()
  const payload = await getPayload({ config })

  const { docs: itemDocs } = await payload.find({
    collection: 'work',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    draft: showDrafts,
    overrideAccess: showDrafts,
  })
  const item = itemDocs[0]
  if (!item) return notFound()

  const { docs: allDocs } = await payload.find({
    collection: 'work',
    sort: 'order',
    limit: 100,
    depth: 0,
    overrideAccess: showDrafts,
    ...(showDrafts ? {} : { where: { _status: { equals: 'published' as const } } }),
  })
  const idx = allDocs.findIndex((w) => w.slug === slug)
  const prev = idx > 0 ? allDocs[idx - 1] : undefined
  const next = idx >= 0 && idx < allDocs.length - 1 ? allDocs[idx + 1] : undefined

  const coverMedia = typeof item.cover === 'object' && item.cover !== null ? (item.cover as Media) : null
  const uploadedCoverUrl = coverMedia?.url ?? ''
  const coverUrl = uploadedCoverUrl || (item.href ? microlinkScreenshot(item.href) : '')
  const coverW = coverMedia?.width ?? undefined
  const coverH = coverMedia?.height ?? undefined

  const galleryImages =
    item.images?.map((img) => {
      const m = typeof img.image === 'object' && img.image !== null ? (img.image as Media) : null
      return {
        src: m?.url ?? '',
        caption: img.caption ?? undefined,
        width: m?.width ?? undefined,
        height: m?.height ?? undefined,
      }
    }) ?? []

  return (
    <PageShell>
      <BackHomeNav parent="/work" />
      <article className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
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
              className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/8 dark:hover:bg-white/15 transition-colors px-3 h-8 text-[13px] shrink-0 whitespace-nowrap mt-1"
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
          <div
            className="relative w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-black/5 dark:bg-white/5"
            style={{ aspectRatio: coverW && coverH ? `${coverW} / ${coverH}` : '4 / 3' }}
          >
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
            <div
              className="relative w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10"
              style={{ aspectRatio: img.width && img.height ? `${img.width} / ${img.height}` : '4 / 3' }}
            >
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
