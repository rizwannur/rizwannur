import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { ThoughtRow } from '@/components/sections/ThoughtRow'
import { Footer } from '@/components/layout/Footer'
import { SearchInput } from '@/components/ui/SearchInput'
import type { Thought } from '@/lib/types/thoughts'

export const metadata = { title: 'Thoughts — Rafey' }

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function ThoughtsIndex({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const payload = await getPayload({ config })

  const query = q?.trim()

  const { docs } = await payload.find({
    collection: 'posts',
    ...(query
      ? {
          where: {
            or: [
              { title: { like: query } },
              { excerpt: { like: query } },
            ],
          },
        }
      : {}),
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
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-8">
          A collection of thoughts, ideas, and reflections on design, development, and my personal life.
        </p>
        <SearchInput
          defaultValue={query ?? ''}
          placeholder="Search posts..."
          resultCount={query ? thoughtItems.length : undefined}
        />
        {thoughtItems.length > 0 ? (
          <div className="flex flex-col gap-7">
            {thoughtItems.map((t) => (
              <ThoughtRow key={t.slug} item={t} />
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-neutral-500 dark:text-neutral-400 py-10 text-center">
            No posts found for &ldquo;{query}&rdquo;
          </p>
        )}
      </section>
      <Footer />
    </PageShell>
  )
}
