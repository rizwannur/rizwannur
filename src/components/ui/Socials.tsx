'use client'

import { FileText, Globe, Mail, Phone } from 'lucide-react'
import { useAudio } from '@/components/providers/AudioProvider'
import { cn } from '@/lib/cn'

const baseSvg = 'size-3.5'

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className={baseSvg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
)
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className={baseSvg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 1 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className={baseSvg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className={baseSvg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)
const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" className={baseSvg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3z" />
    <path d="M9.5 8.5c.2 3.2 2.8 5.8 6 6" />
    <path d="M9.5 8.5l1.4-1 1.1 2-1 .9" />
    <path d="M15.5 14.5l1-1 2 1.1-1 1.4" />
  </svg>
)

const ICONS = {
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsappIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  resume: () => <FileText className={baseSvg} />,
  mail: () => <Mail className={baseSvg} />,
  phone: () => <Phone className={baseSvg} />,
  website: () => <Globe className={baseSvg} />,
} as const

type SocialKind = keyof typeof ICONS
type Social = { label: string; href: string; kind: SocialKind }

const SOCIAL_STYLES: Record<SocialKind, { link: string; icon: string }> = {
  twitter: {
    link: 'hover:border-sky-500/25 hover:bg-sky-500/5 dark:hover:border-sky-400/25 dark:hover:bg-sky-400/10',
    icon: 'bg-sky-500/12 text-sky-600 ring-sky-500/20 group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-400/15 dark:text-sky-300 dark:ring-sky-300/20 dark:group-hover:bg-sky-400 dark:group-hover:text-sky-950',
  },
  instagram: {
    link: 'hover:border-pink-500/25 hover:bg-pink-500/5 dark:hover:border-pink-400/25 dark:hover:bg-pink-400/10',
    icon: 'bg-gradient-to-br from-pink-500/15 via-fuchsia-500/15 to-orange-400/20 text-pink-600 ring-pink-500/20 group-hover:from-pink-500 group-hover:via-fuchsia-500 group-hover:to-orange-400 group-hover:text-white dark:text-pink-300 dark:ring-pink-300/20',
  },
  whatsapp: {
    link: 'hover:border-green-500/25 hover:bg-green-500/5 dark:hover:border-green-300/25 dark:hover:bg-green-300/10',
    icon: 'bg-green-500/12 text-green-700 ring-green-500/20 group-hover:bg-green-500 group-hover:text-white dark:bg-green-300/15 dark:text-green-200 dark:ring-green-200/20 dark:group-hover:bg-green-300 dark:group-hover:text-green-950',
  },
  github: {
    link: 'hover:border-violet-500/25 hover:bg-violet-500/5 dark:hover:border-violet-400/25 dark:hover:bg-violet-400/10',
    icon: 'bg-violet-500/12 text-violet-600 ring-violet-500/20 group-hover:bg-violet-500 group-hover:text-white dark:bg-violet-400/15 dark:text-violet-300 dark:ring-violet-300/20 dark:group-hover:bg-violet-400 dark:group-hover:text-violet-950',
  },
  linkedin: {
    link: 'hover:border-blue-600/25 hover:bg-blue-600/5 dark:hover:border-blue-400/25 dark:hover:bg-blue-400/10',
    icon: 'bg-blue-600/12 text-blue-700 ring-blue-600/20 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-400/15 dark:text-blue-300 dark:ring-blue-300/20 dark:group-hover:bg-blue-400 dark:group-hover:text-blue-950',
  },
  resume: {
    link: 'hover:border-amber-500/25 hover:bg-amber-500/5 dark:hover:border-amber-300/25 dark:hover:bg-amber-300/10',
    icon: 'bg-amber-500/14 text-amber-700 ring-amber-500/20 group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-300/15 dark:text-amber-200 dark:ring-amber-200/20 dark:group-hover:bg-amber-300 dark:group-hover:text-amber-950',
  },
  mail: {
    link: 'hover:border-emerald-500/25 hover:bg-emerald-500/5 dark:hover:border-emerald-300/25 dark:hover:bg-emerald-300/10',
    icon: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-300/15 dark:text-emerald-200 dark:ring-emerald-200/20 dark:group-hover:bg-emerald-300 dark:group-hover:text-emerald-950',
  },
  phone: {
    link: 'hover:border-teal-500/25 hover:bg-teal-500/5 dark:hover:border-teal-300/25 dark:hover:bg-teal-300/10',
    icon: 'bg-teal-500/12 text-teal-700 ring-teal-500/20 group-hover:bg-teal-500 group-hover:text-white dark:bg-teal-300/15 dark:text-teal-200 dark:ring-teal-200/20 dark:group-hover:bg-teal-300 dark:group-hover:text-teal-950',
  },
  website: {
    link: 'hover:border-cyan-500/25 hover:bg-cyan-500/5 dark:hover:border-cyan-300/25 dark:hover:bg-cyan-300/10',
    icon: 'bg-cyan-500/12 text-cyan-700 ring-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white dark:bg-cyan-300/15 dark:text-cyan-200 dark:ring-cyan-200/20 dark:group-hover:bg-cyan-300 dark:group-hover:text-cyan-950',
  },
}

export function Socials({ socials }: { socials: Social[] }) {
  const { playClick } = useAudio()
  return (
    <div className="flex flex-wrap gap-2.5">
      {socials.map((s) => {
        const Icon = ICONS[s.kind]
        const style = SOCIAL_STYLES[s.kind]
        return (
          <a
            key={s.kind}
            href={s.href}
            target={s.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            onClick={() => playClick()}
            aria-label={s.label}
            className={cn(
              'group inline-flex h-10 items-center overflow-hidden rounded-full border border-black/8 bg-white/75 p-2 text-[13px] font-medium text-neutral-700 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-sm',
              'transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:text-neutral-950 hover:shadow-sm active:translate-y-0 active:scale-[0.98]',
              'outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              'dark:border-white/10 dark:bg-white/7 dark:text-neutral-200 dark:shadow-none dark:hover:text-white dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-black',
              style.link,
            )}
          >
            <span
              className={cn(
                'inline-flex size-6 items-center justify-center rounded-full ring-1 transition-all duration-200 group-hover:scale-105',
                style.icon,
              )}
              aria-hidden
            >
              <Icon />
            </span>
            <span className="max-w-0 whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-200 ease-out group-hover:ml-2 group-hover:max-w-20 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-20 group-focus-visible:opacity-100">
              {s.label}
            </span>
          </a>
        )
      })}
    </div>
  )
}
