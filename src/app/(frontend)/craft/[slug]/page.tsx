import { notFound } from 'next/navigation'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { PrevNext } from '@/components/ui/PrevNext'
import { craft } from '@/data/craft'

export function generateStaticParams() {
  return craft.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = craft.find((c) => c.slug === slug)
  return { title: item?.title ?? 'Craft' }
}

export default async function CraftDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = craft.find((c) => c.slug === slug)
  if (!item) return notFound()

  const idx = craft.findIndex((c) => c.slug === slug)
  const next = craft[idx + 1]
  const prev = craft[idx - 1]

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
