'use client'

import Link from 'next/link'
import { Home, Reply } from 'lucide-react'
import { ThemeAudioPill } from './ThemeAudioPill'
import { useAudio } from './AudioProvider'

export type BackHomeNavProps = {
  /** Path of the parent index (e.g. '/work', '/thoughts', '/craft'). Omit on parent index pages. */
  parent?: string
}

export function BackHomeNav({ parent }: BackHomeNavProps) {
  const { playClick } = useAudio()
  return (
    <header className="flex items-center justify-between w-full">
      <div className="flex items-center gap-0.5 p-0.5 bg-black/5 dark:bg-white/10 rounded-full h-[32px]">
        <Link
          href="/"
          aria-label="Go home"
          onClick={() => playClick()}
          className="size-7 inline-flex items-center justify-center rounded-full text-black/75 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Home className="size-[13px] -mt-px" />
        </Link>
        {parent && (
          <Link
            href={parent}
            aria-label={`Back to ${parent.replace('/', '')}`}
            onClick={() => playClick()}
            className="size-7 inline-flex items-center justify-center rounded-full text-black/75 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Reply className="size-[14px] -mt-px" strokeWidth={2.5} />
          </Link>
        )}
      </div>
      <ThemeAudioPill />
    </header>
  )
}
