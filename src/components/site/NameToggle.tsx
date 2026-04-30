'use client'

import Image from 'next/image'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useState } from 'react'
import { profile } from '@/data/profile'
import { useAudio } from './AudioProvider'

const ease = [0.32, 0.72, 0.0, 1] as const
const layoutTransition = { duration: 0.42, ease }

export function NameToggle() {
  const [expanded, setExpanded] = useState(false)
  const { playClick } = useAudio()

  return (
    <MotionConfig transition={layoutTransition}>
      <div className="flex items-center gap-3.5">
        <motion.button
          type="button"
          aria-label={expanded ? 'Hide full name' : 'Show full name'}
          aria-pressed={expanded}
          onClick={() => {
            playClick()
            setExpanded((v) => !v)
          }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full size-12 overflow-hidden bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:focus-visible:ring-white/40"
        >
          <Image
            src={profile.avatar}
            alt={profile.shortName}
            width={330}
            height={330}
            priority
            className="size-full object-cover"
          />
        </motion.button>

        <motion.div layout="position" className="flex flex-col">
          <motion.h1 layout className="m-0">
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? 'Show short name' : 'Show full name'}
              onClick={() => {
                playClick()
                setExpanded((v) => !v)
              }}
              className="font-display text-2xl leading-[1.1] text-black dark:text-white flex flex-wrap gap-x-2 items-baseline text-left bg-transparent border-0 p-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:focus-visible:ring-white/40 rounded-sm"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {!expanded ? (
                  <motion.span
                    key="collapsed"
                    layout="position"
                    initial={{ opacity: 0, filter: 'blur(6px)', x: -8, width: 0 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', x: 0, width: 'auto' }}
                    exit={{ opacity: 0, filter: 'blur(6px)', x: -8, width: 0 }}
                    transition={{ duration: 0.42, ease }}
                    className="overflow-hidden whitespace-nowrap inline-block"
                  >
                    {profile.shortName}
                  </motion.span>
                ) : (
                  <motion.span
                    key="expanded"
                    layout="position"
                    initial={{ opacity: 0, filter: 'blur(6px)', x: -8, width: 0 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', x: 0, width: 'auto' }}
                    exit={{ opacity: 0, filter: 'blur(6px)', x: -8, width: 0 }}
                    transition={{ duration: 0.42, ease }}
                    className="overflow-hidden whitespace-nowrap inline-block"
                  >
                    {profile.fullName}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.h1>
          <motion.p layout="position" className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium">
            {profile.role}
          </motion.p>
        </motion.div>
      </div>
    </MotionConfig>
  )
}
