'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useAudio } from './AudioProvider'
import type { Craft } from '@/data/craft'

export function CraftGrid({ items, columns = 2 }: { items: Craft[]; columns?: 1 | 2 }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const { playClick } = useAudio()

  return (
    <div
      className={`w-full grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : ''} gap-x-0 gap-y-0`}
      onMouseLeave={() => setHovered(null)}
    >
      {items.map((item, i) => {
        const isHovered = hovered === i
        const dimmed = hovered !== null && !isHovered
        return (
          <Link
            key={item.slug}
            href={`/craft/${item.slug}`}
            onClick={() => playClick()}
            onMouseEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            className={`block cursor-pointer pt-2.5 pb-2.5 [&:first-child]:pt-0 [&:last-child]:pb-0 ${
              columns === 2
                ? 'md:[&:nth-child(odd)]:pr-2.5 md:[&:nth-child(even)]:pl-2.5 md:pt-0 md:pb-0 md:[&:nth-child(-n+2)]:pt-0 md:[&:nth-last-child(-n+2)]:pb-0'
                : ''
            }`}
          >
            <motion.div
              animate={{ opacity: dimmed ? 0.25 : 1, scale: isHovered ? 1.01 : 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex flex-col gap-3 w-full p-1 bg-white dark:bg-white/5 border border-black/10 dark:border-white/8 rounded-[10px] hover:border-black/20 dark:hover:border-white/10 transition-colors"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center">
                {item.cover ? (
                  <Image src={item.cover} alt={`${item.title} cover`} fill sizes="320px" className="object-cover" />
                ) : (
                  <CraftPlaceholder title={item.title} />
                )}
              </div>
              <div className="px-2 pb-1 pt-1">
                <div className="text-[15px] font-medium text-neutral-900 dark:text-white">{item.title}</div>
                <div className="text-[13px] text-neutral-500 dark:text-neutral-400">{item.date}</div>
              </div>
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}

function CraftPlaceholder({ title }: { title: string }) {
  const initials = title
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
      <div className="font-display text-3xl text-neutral-400 dark:text-neutral-600">{initials}</div>
    </div>
  )
}
