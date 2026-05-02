import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Socials } from '@/components/ui/Socials'
import type { Media } from '@/payload-types'

type SocialKind = 'twitter' | 'instagram' | 'github' | 'linkedin' | 'resume' | 'mail'

export async function AuthorCard() {
  const payload = await getPayload({ config })
  const profile = await payload.findGlobal({ slug: 'profile', depth: 1 })

  const avatarUrl =
    typeof profile.avatar === 'object' && profile.avatar
      ? (profile.avatar as Media).url ?? null
      : null
  const avatar = avatarUrl ?? '/rafey.png'

  const fullName = profile.fullName ?? 'Rizwan Nur Rafey'
  const role = profile.role ?? ''
  const bio = profile.intro?.[0]?.text ?? ''
  const bookCall = profile.bookCall

  const socials = (profile.socials ?? []).map((s) => ({
    label: s.label,
    href: s.href,
    kind: s.kind as SocialKind,
  }))

  return (
    <aside
      aria-label={`About ${fullName}`}
      className="mt-12 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-6 sm:p-7 flex flex-col gap-5"
    >
      <div className="flex items-start gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-black/5 dark:bg-white/10">
          <Image src={avatar} alt={fullName} fill sizes="56px" className="object-cover" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Written by
          </p>
          <h2 className="font-display text-xl leading-tight">{fullName}</h2>
          {role && (
            <p className="text-[13.5px] text-neutral-600 dark:text-neutral-400">{role}</p>
          )}
        </div>
      </div>

      {bio && (
        <p className="text-[14.5px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {bio}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {socials.length > 0 && <Socials socials={socials} />}
        {bookCall && (
          <Link
            href={bookCall}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-3 h-8 text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Book a call
          </Link>
        )}
      </div>
    </aside>
  )
}
