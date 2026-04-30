'use client'

import Link from 'next/link'
import { useAudio } from './AudioProvider'

export function ViewAll({ href }: { href: string }) {
  const { playClick } = useAudio()
  return (
    <div className="mt-6 flex justify-end">
      <Link
        href={href}
        onClick={() => playClick()}
        className="text-[11px] font-medium tracking-wider uppercase text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors"
      >
        View all
      </Link>
    </div>
  )
}
