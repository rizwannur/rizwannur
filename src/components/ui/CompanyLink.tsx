'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useAudio } from '@/components/providers/AudioProvider'

export type CompanyLinkProps = {
  name: string
  href: string
  brand?: string
  logo?: string
}

export function CompanyLink({ name, href, brand, logo }: CompanyLinkProps) {
  const [hovered, setHovered] = useState(false)
  const { playClick } = useAudio()

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => playClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <motion.span
        animate={{ paddingLeft: hovered ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="font-medium text-black/85 dark:text-white/85 inline-flex items-center relative group underline underline-offset-2 transition-colors"
        style={{
          color: hovered && brand ? brand : undefined,
          textDecorationColor: hovered ? 'transparent' : undefined,
        }}
      >
        <motion.span
          aria-hidden
          initial={{ opacity: 0, scale: 0.6, filter: 'blur(4px)' }}
          animate={{
            opacity: hovered ? 1 : 0,
            filter: hovered ? 'blur(0px)' : 'blur(4px)',
            scale: hovered ? 1 : 0.6,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="size-[14px] absolute left-0 top-0 bottom-0 my-auto rounded-[3px] overflow-hidden border border-black/10 dark:border-white/10"
          style={{ background: brand ?? 'rgba(0,0,0,0.25)' }}
        >
          {logo ? (
            <Image src={logo} alt="" width={28} height={28} className="size-full object-cover" />
          ) : (
            <span className="size-full flex items-center justify-center text-white text-[8px] font-semibold leading-none" aria-hidden>
              {name[0]?.toUpperCase()}
            </span>
          )}
        </motion.span>
        <span className="leading-[20px]">{name}</span>
      </motion.span>
    </a>
  )
}
