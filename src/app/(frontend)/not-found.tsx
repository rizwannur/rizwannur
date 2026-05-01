import Link from 'next/link'
import { Search } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { Footer } from '@/components/layout/Footer'

export const metadata = { title: 'Page not found — Rafey' }
export const revalidate = 300

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function NotFound() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    sort: '-date',
    limit: 5,
    depth: 0,
    where: { _status: { equals: 'published' } },
  })

  return (
    <PageShell>
      <BackHomeNav />
      <section className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="font-display text-3xl">Page not found</h1>
          <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Try searching the
            thoughts archive or check out a recent post.
          </p>
        </header>

        <form action="/thoughts" method="get" className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            name="q"
            placeholder="Search posts..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/8 dark:border-white/8 text-[14px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:border-black/20 dark:focus:border-white/15 transition-colors"
          />
        </form>

        {docs.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-lg">Recent thoughts</h2>
            <ul className="flex flex-col gap-3">
              {docs.map((post) => (
                <li key={post.id}>
                  <Link href={`/thoughts/${post.slug}`} className="group flex flex-col gap-0.5">
                    <span className="text-[15px] font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                      {post.title}
                    </span>
                    <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                      {formatDate(post.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/"
          className="text-[15px] text-neutral-700 dark:text-neutral-300 hover:underline self-start"
        >
          ← Back to home
        </Link>
      </section>
      <Footer />
    </PageShell>
  )
}
