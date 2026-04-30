import { PageShell } from '@/components/site/PageShell'
import { Header } from '@/components/site/Header'
import { Socials } from '@/components/site/Socials'
import { SectionHeading } from '@/components/site/SectionHeading'
import { WorkGrid } from '@/components/site/WorkGrid'
// import { CraftGrid } from '@/components/site/CraftGrid'
import { ThoughtRow } from '@/components/site/ThoughtRow'
import { ViewAll } from '@/components/site/ViewAll'
import { Footer } from '@/components/site/Footer'
import { CompanyLink } from '@/components/site/CompanyLink'
import { profile } from '@/data/profile'
import { work } from '@/data/work'
import { thoughts } from '@/data/thoughts'
// import { craft } from '@/data/craft'

export default function HomePage() {
  return (
    <PageShell>
      <Header />

      {/* Intro */}
      <section className="space-y-5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        <p className="font-display text-3xl leading-tight text-black dark:text-white md:text-4xl">
          {profile.headline}
        </p>
        {profile.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          {profile.recent.lead}{' '}
          <CompanyLink {...profile.recent.company} />
          {profile.recent.tail}
        </p>
        <p>
          {profile.past.lead}
          {profile.past.companies.map((c, j) => (
            <span key={c.name}>
              {j === 0 ? ' ' : j === profile.past.companies.length - 1 ? ', and ' : ', '}
              <CompanyLink {...c} />
            </span>
          ))}
          {profile.past.tail}
        </p>
        <p>{profile.searching}</p>
        <p className="rounded-2xl border border-black/8 bg-black/[0.03] p-4 text-[14px] text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300">
          {profile.availability}
        </p>

        <div className="pt-2">
          <Socials />
        </div>
      </section>

      {/* Work */}
      <section>
        <SectionHeading>Work</SectionHeading>
        <WorkGrid items={work.slice(0, 6)} />
        <ViewAll href="/work" />
      </section>

      {/* Thoughts */}
      <section>
        <SectionHeading>Thoughts</SectionHeading>
        <div className="flex flex-col gap-6">
          {thoughts.slice(0, 4).map((t) => (
            <ThoughtRow key={t.slug} item={t} />
          ))}
        </div>
        <ViewAll href="/thoughts" />
      </section>

      {/* Craft */}
      {/* <section>
        <SectionHeading>Craft</SectionHeading>
        <CraftGrid items={craft.slice(0, 6)} />
        <ViewAll href="/craft" />
      </section> */}

      <Footer />
    </PageShell>
  )
}
