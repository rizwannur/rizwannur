import { PageShell } from '@/components/layout/PageShell'
import { BackHomeNav } from '@/components/layout/BackHomeNav'
import { CraftGrid } from '@/components/sections/CraftGrid'
import { Footer } from '@/components/layout/Footer'
import { craft } from '@/data/craft'

export const metadata = { title: 'Craft' }

export default function CraftIndex() {
  return (
    <PageShell>
      <BackHomeNav />
      <section>
        <h1 className="font-display text-3xl mb-3">Craft</h1>
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400 max-w-prose mb-10">
          A collection of components and widgets exploring design, animations, and micro-interactions.
        </p>
        <CraftGrid items={craft} />
      </section>
      <Footer />
    </PageShell>
  )
}
