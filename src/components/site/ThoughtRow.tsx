'use client'

import Link from 'next/link'
import { useAudio } from './AudioProvider'
import type { Thought } from '@/data/thoughts'

export function ThoughtRow({ item }: { item: Thought }) {
  const { playClick } = useAudio()
  return (
    <Link
      href={`/thoughts/${item.slug}`}
      onClick={() => playClick()}
      className="group block"
    >
      <div className="text-[15px] font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
        {item.title}
      </div>
      <div className="mt-1 flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
        <span>{item.date}</span>
        <span aria-hidden>•</span>
        <span>{item.readTime}</span>
      </div>
    </Link>
  )
}
