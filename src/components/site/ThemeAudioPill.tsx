'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Volume, Volume2, VolumeX } from 'lucide-react'
import { useAudio } from './AudioProvider'
import { cn } from '@/lib/cn'

export function ThemeAudioPill() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()
  const { level, cycleLevel, playSweep, playClick } = useAudio()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="flex items-center gap-0.5 p-0.5 bg-black/5 dark:bg-[#222222] rounded-full h-[32px] w-[62px]" aria-hidden />
  }

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    playSweep()
    if (!document.startViewTransition) {
      setTheme(next)
      return
    }
    document.startViewTransition(() => setTheme(next))
  }

  const VolumeIcon = level === 'muted' ? VolumeX : level === 'low' ? Volume : Volume2
  const volumeLabel =
    level === 'muted'
      ? 'Background audio off — click to set low volume'
      : level === 'low'
        ? 'Background audio at low volume — click for full'
        : 'Background audio at full volume — click to mute'

  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-black/5 dark:bg-[#222222] rounded-full h-[32px] w-[62px]">
      <PillButton
        active={level !== 'muted'}
        onClick={() => {
          playClick()
          cycleLevel()
        }}
        ariaLabel={volumeLabel}
      >
        <VolumeIcon className="size-[15px] text-black/60 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" fill="currentColor" />
      </PillButton>
      <PillButton active onClick={toggleTheme} ariaLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
        {isDark ? (
          <Moon className="size-[15px] text-black/60 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" fill="currentColor" />
        ) : (
          <Sun className="size-[15px] text-black/60 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" fill="currentColor" />
        )}
      </PillButton>
    </div>
  )
}

function PillButton({
  children,
  onClick,
  ariaLabel,
  active,
}: {
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
  ariaLabel: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        'relative size-7 inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-[0.98] hover:bg-black/5 dark:hover:bg-white/10',
      )}
    >
      {children}
    </button>
  )
}
