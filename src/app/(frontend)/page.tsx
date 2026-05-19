import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Header } from '@/components/layout/Header'
import { Socials } from '@/components/ui/Socials'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { CraftGrid } from '@/components/sections/CraftGrid'
import { ThoughtRow } from '@/components/sections/ThoughtRow'
import { ViewAll } from '@/components/ui/ViewAll'
import { Footer } from '@/components/layout/Footer'
import type { Work } from '@/lib/types/work'
import type { Thought } from '@/lib/types/thoughts'
import type { Craft } from '@/lib/types/craft'
import type { Media } from '@/payload-types'
import { microlinkScreenshot } from '@/lib/microlink'
import { PROFILE } from '@/lib/profile'
import { isAuthedAdmin } from '@/lib/preview-mode'

export const revalidate = 60

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  // Public reads: explicit `_status: published` filter. Payload's Local API
  // defaults to `overrideAccess: true` and silently bypasses the read access
  // filter, so we can't rely on it. Authed admins skip the filter and see
  // drafts inline — same as they would in the admin UI.
  const showDrafts = await isAuthedAdmin()
  const scope = showDrafts
    ? { overrideAccess: true as const, draft: true as const }
    : { where: { _status: { equals: 'published' as const } } }
  const [{ docs: workDocs }, { docs: postDocs }, { docs: craftDocs }] = await Promise.all([
    payload.find({ collection: 'work', sort: 'order', limit: 6, depth: 1, ...scope }),
    payload.find({ collection: 'posts', sort: '-date', limit: 4, depth: 0, ...scope }),
    payload.find({ collection: 'craft', sort: 'order', limit: 6, depth: 1 }),
  ])

  const workItems: Work[] = workDocs.map((item) => {
    const coverMedia = typeof item.cover === 'object' && item.cover !== null ? (item.cover as Media) : null
    const uploadedUrl = coverMedia?.url ?? ''
    const cover = uploadedUrl || (item.href ? microlinkScreenshot(item.href) : '')
    return {
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      cover,
      coverWidth: coverMedia?.width ?? undefined,
      coverHeight: coverMedia?.height ?? undefined,
      date: item.date,
      href: item.href ?? undefined,
      description: item.description,
      body: [],
    }
  })

  const craftItems: Craft[] = craftDocs.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.date,
    description: item.description,
    cover: typeof item.cover === 'object' ? ((item.cover as Media).url ?? undefined) : undefined,
    credit:
      item.credit?.name
        ? { name: item.credit.name, href: item.credit.href ?? undefined }
        : undefined,
  }))

  const thoughtItems: Thought[] = postDocs.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: formatDate(item.date),
    readTime: item.readTime,
    excerpt: item.excerpt,
    body: [],
  }))
  return (
    <PageShell>
      <Header
        avatar={PROFILE.avatar}
        shortName={PROFILE.shortName}
        fullName={PROFILE.fullName}
        role={PROFILE.role}
      />

      {/* Intro */}
      <section className="space-y-5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        <p className="font-display text-3xl leading-tight text-black dark:text-white md:text-4xl">
          {PROFILE.headline}
        </p>
        {PROFILE.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>{PROFILE.searching}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={PROFILE.bookCall}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-[13px] font-semibold text-white transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-black dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-black"
          >
            Book a call
            <ArrowUpRight className="size-3.5 text-white/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-black/45" aria-hidden />
          </Link>
          <Socials socials={PROFILE.socials} />
        </div>
      </section>

      {/* Work */}
      <section>
        <SectionHeading>Work</SectionHeading>
        <WorkGrid items={workItems} />
        <ViewAll href="/work" />
      </section>

      {/* Craft */}
      {craftItems.length > 0 && (
        <section>
          <SectionHeading>Craft</SectionHeading>
          <CraftGrid items={craftItems} />
          <ViewAll href="/craft" />
        </section>
      )}

      {/* Thoughts */}
      <section>
        <SectionHeading>Thoughts</SectionHeading>
        <div className="flex flex-col gap-6">
          {thoughtItems.map((t) => (
            <ThoughtRow key={t.slug} item={t} />
          ))}
        </div>
        <ViewAll href="/thoughts" />
      </section>

      <Footer />
    </PageShell>
  )
}
