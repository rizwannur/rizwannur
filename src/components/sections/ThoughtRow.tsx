'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAudio } from '@/components/providers/AudioProvider'
import { TagChips } from '@/components/ui/TagChips'
import type { Thought } from '@/lib/types/thoughts'

export function ThoughtRow({ item }: { item: Thought }) {
  const { playClick } = useAudio()
  return (
    <Link href={`/thoughts/${item.slug}`} onClick={() => playClick()} className="group block">
      <div className="flex gap-4 items-start">
        {item.coverImage?.url && (
          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={item.coverImage.url}
              alt={item.coverImage.alt}
              fill
              sizes="(min-width: 640px) 96px, 80px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
            {item.title}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
            <span>{item.date}</span>
            <span aria-hidden>•</span>
            <span>{item.readTime}</span>
          </div>
          {item.excerpt && (
            <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {item.excerpt}
            </p>
          )}
          {item.tags && item.tags.length > 0 && <TagChips tags={item.tags} className="mt-2" />}
        </div>
      </div>
    </Link>
  )
}
