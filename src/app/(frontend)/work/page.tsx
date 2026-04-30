import { PageShell } from '@/components/site/PageShell'
import { BackHomeNav } from '@/components/site/BackHomeNav'
import { WorkGrid } from '@/components/site/WorkGrid'
import { Footer } from '@/components/site/Footer'
import { work } from '@/data/work'

export const metadata = { title: 'Work' }

export default function WorkIndex() {
  return (
    <PageShell>
      <BackHomeNav />
      <section>
        <h1 className="font-display text-3xl mb-3">Work</h1>
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-10">
          Selected projects and case studies from my work in design and development.
        </p>
        <WorkGrid items={work} />
      </section>
      <Footer />
    </PageShell>
  )
}
