'use client'

import Link from 'next/link'
import { useAudio } from '@/components/providers/AudioProvider'

type Item = { slug: string; title: string }

export function PrevNext({ basePath, prev, next }: { basePath: string; prev?: Item; next?: Item }) {
  const { playClick } = useAudio()
  return (
    <nav className="flex items-start justify-between w-full gap-4 border-t-2 border-black/5 dark:border-white/5 pt-10">
      <div className="min-w-[20%]">
        {prev && (
          <Link
            href={`${basePath}/${prev.slug}`}
            onClick={() => playClick()}
            className="text-left flex flex-col items-start gap-0.5 max-w-full group"
          >
            <span className="text-[13px] text-black/50 dark:text-white/50 group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300 font-medium">
              Previous
            </span>
            <span className="text-[15px] text-black/80 dark:text-white/80 line-clamp-2 font-medium group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div className="min-w-[20%] max-w-[40%] ml-auto">
        {next && (
          <Link
            href={`${basePath}/${next.slug}`}
            onClick={() => playClick()}
            className="text-right flex flex-col items-end gap-0.5 max-w-full group"
          >
            <span className="text-[13px] text-black/50 dark:text-white/50 group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300 font-medium">
              Next
            </span>
            <span className="text-[15px] text-black/80 dark:text-white/80 line-clamp-2 font-medium group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  )
}
