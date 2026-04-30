'use client'

import { Globe, Mail, Phone, Sparkles } from 'lucide-react'
import { useAudio } from './AudioProvider'
import { profile } from '@/data/profile'

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

const ICONS = {
  contra: () => <Sparkles className={baseSvg} />,
  twitter: TwitterIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  mail: () => <Mail className={baseSvg} />,
  phone: () => <Phone className={baseSvg} />,
  website: () => <Globe className={baseSvg} />,
} as const

export function Socials() {
  const { playClick } = useAudio()
  return (
    <div className="flex flex-wrap gap-2">
      {profile.socials.map((s) => {
        const Icon = ICONS[s.kind]
        return (
          <a
            key={s.kind}
            href={s.href}
            target={s.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            onClick={() => playClick()}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/8 px-3 h-8 text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-black/8 dark:hover:bg-white/12 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5"
          >
            <Icon />
            {s.label}
          </a>
        )
      })}
    </div>
  )
}
