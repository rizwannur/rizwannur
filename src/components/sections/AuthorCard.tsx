import Image from 'next/image'
import Link from 'next/link'
import { Socials } from '@/components/ui/Socials'
import { PROFILE } from '@/lib/profile'

export function AuthorCard() {
  const bio = PROFILE.intro[0]

  return (
    <aside
      aria-label={`About ${PROFILE.fullName}`}
      className="mt-12 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-6 sm:p-7 flex flex-col gap-5"
    >
      <div className="flex items-start gap-4">
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
        <Link
          href={PROFILE.bookCall}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-3 h-8 text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          Book a call
        </Link>
      </div>
    </aside>
  )
}
