import { notFound } from 'next/navigation'
import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { PrevNext } from '@/components/site/PrevNext'
import { thoughts } from '@/data/thoughts'

export function generateStaticParams() {
  return thoughts.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = thoughts.find((t) => t.slug === slug)
  return { title: item?.title ?? 'Thoughts' }
}

export default async function ThoughtDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = thoughts.find((t) => t.slug === slug)
  if (!item) return notFound()

  const idx = thoughts.findIndex((t) => t.slug === slug)
  const next = thoughts[idx + 1]
  const prev = thoughts[idx - 1]

  return (
    <PageShell>
      <BackHomeNav parent="/thoughts" />
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-3xl leading-tight">{item.title}</h1>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">
            {item.date} <span aria-hidden>•</span> {item.readTime}
          </p>
        </header>
        {item.body.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            {p}
          </p>
        ))}
      </article>

      <PrevNext basePath="/thoughts" prev={prev} next={next} />
    </PageShell>
  )
}
