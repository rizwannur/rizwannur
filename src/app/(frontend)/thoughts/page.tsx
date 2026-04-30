import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { ThoughtRow } from '@/components/site/ThoughtRow'
import { Footer } from '@/components/site/Footer'
import { thoughts } from '@/data/thoughts'

export const metadata = { title: 'Thoughts' }

export default function ThoughtsIndex() {
  return (
    <PageShell>
      <BackHomeNav />
      <section>
        <h1 className="font-display text-3xl mb-3">Thoughts</h1>
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-10">
          A collection of thoughts, ideas, and reflections on design, development, and my personal life.
        </p>
        <div className="flex flex-col gap-7">
          {thoughts.map((t) => (
            <ThoughtRow key={t.slug} item={t} />
          ))}
        </div>
      </section>
      <Footer />
    </PageShell>
  )
}
