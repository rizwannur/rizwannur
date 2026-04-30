import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { ThoughtRow } from '@/components/site/ThoughtRow'
import { Footer } from '@/components/site/Footer'
import type { Thought } from '@/data/thoughts'

export const metadata = { title: 'Thoughts — Rafey' }

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function ThoughtsIndex() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    sort: '-date',
    limit: 100,
    depth: 0,
  })

  const thoughtItems: Thought[] = docs.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: formatDate(item.date),
    readTime: item.readTime,
    excerpt: item.excerpt,
    body: [],
  }))

  return (
    <PageShell>
      <BackHomeNav />
      <section>
        <h1 className="font-display text-3xl mb-3">Thoughts</h1>
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-10">
          A collection of thoughts, ideas, and reflections on design, development, and my personal life.
        </p>
        <div className="flex flex-col gap-7">
          {thoughtItems.map((t) => (
            <ThoughtRow key={t.slug} item={t} />
          ))}
        </div>
      </section>
      <Footer />
    </PageShell>
  )
}
