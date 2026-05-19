import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Socials } from '@/components/ui/Socials'
import { PROFILE } from '@/lib/profile'

export function AuthorCard() {
  const bio = PROFILE.intro[0]

  return (
    <aside
      aria-label={`About ${PROFILE.fullName}`}
      className="relative mt-12 flex flex-col gap-5 rounded-2xl border border-black/5 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-7"
    >
      <Link
        href={PROFILE.bookCall}
        target="_blank"
        rel="noreferrer"
        aria-label={`Book a call with ${PROFILE.fullName}`}
        className="group absolute right-6 top-6 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-neutral-950 via-black to-neutral-800 px-3.5 text-[13px] font-semibold text-white shadow-lg shadow-black/15 ring-1 ring-black/10 transition-[box-shadow,transform,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:from-white dark:via-neutral-100 dark:to-neutral-300 dark:text-black dark:shadow-white/10 dark:ring-white/20 dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-black sm:right-7 sm:top-7"
      >
        <span className="relative flex size-2.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 ring-2 ring-white/40 dark:ring-black/20" />
        </span>
        Book a call
        <ArrowUpRight className="size-3.5 text-white/55 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-black/45" aria-hidden />
      </Link>

      <div className="flex items-start gap-4 pr-28">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-black/5 dark:bg-white/10">
          <Image src={PROFILE.avatar} alt={PROFILE.fullName} fill sizes="56px" className="object-cover" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Written by
          </p>
          <h2 className="font-display text-xl leading-tight">{PROFILE.fullName}</h2>
          <p className="text-[13.5px] text-neutral-600 dark:text-neutral-400">{PROFILE.role}</p>
        </div>
      </div>

      {bio && (
        <p className="text-[14.5px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {bio}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Socials socials={PROFILE.socials} />
      </div>
    </aside>
  )
}
