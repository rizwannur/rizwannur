import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { PrevNext } from '@/components/site/PrevNext'
import { work } from '@/data/work'

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = work.find((w) => w.slug === slug)
  return { title: item ? `${item.title} — ${item.subtitle}` : 'Work' }
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = work.find((w) => w.slug === slug)
  if (!item) return notFound()

  const idx = work.findIndex((w) => w.slug === slug)
  const next = work[idx + 1]
  const prev = work[idx - 1]

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

        <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{item.description}</p>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-black/5 dark:bg-white/5">
          <Image src={item.cover} alt={`${item.title} cover image`} fill sizes="669px" className="object-cover" priority />
        </div>

        {item.body.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            {p}
          </p>
        ))}

        {item.images?.map((img, i) => (
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

      <PrevNext basePath="/work" prev={prev} next={next} />
    </PageShell>
  )
}
