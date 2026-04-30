'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createLofi, type LofiHandle } from '@/lib/lofi'

export type AudioLevel = 'muted' | 'low' | 'high'

type AudioContextValue = {
  level: AudioLevel
  cycleLevel: () => void
  playClick: () => void
  playSweep: () => void
}

const Ctx = createContext<AudioContextValue | null>(null)

const STORAGE_KEY = 'site:audio-level'

const SOURCES = {
  bg: '/audio/bg-loop.mp3',
  click: '/audio/click.mp3',
  sweep: '/audio/sweep.mp3',
}

// Per-level multipliers for each track. Click/sweep get a quieter floor at "low"
// so the SFX is felt rather than heard.
const VOLUMES: Record<AudioLevel, { bg: number; sfx: number }> = {
  muted: { bg: 0, sfx: 0 },
  low: { bg: 0.12, sfx: 0.15 },
  high: { bg: 0.28, sfx: 0.35 },
}

const NEXT: Record<AudioLevel, AudioLevel> = {
  muted: 'low',
  low: 'high',
  high: 'muted',
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState<AudioLevel>('muted')
  const bgRef = useRef<HTMLAudioElement | null>(null)
  const clickRef = useRef<HTMLAudioElement | null>(null)
  const sweepRef = useRef<HTMLAudioElement | null>(null)
  // When no /audio/bg-loop.mp3 is present, we synthesize a warm lofi pad so
  // the site has a welcoming background hum out of the box.
  const lofiRef = useRef<LofiHandle | null>(null)
  const useLofiFallback = useRef(false)

  // Read persisted preference (default: muted, no autoplay).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AudioLevel | null
      if (saved && saved in VOLUMES) setLevel(saved)
    } catch {
      /* ignore */
    }
  }, [])

  // Lazily create audio elements after the first user interaction so missing
  // files don't 404 in the console for users who never enable sound.
  const ensureLoaded = useCallback(async () => {
    if (bgRef.current || lofiRef.current || clickRef.current || sweepRef.current) return
    const probe = async (src: string, opts: { loop?: boolean } = {}) => {
      try {
        const res = await fetch(src, { method: 'HEAD' })
        if (!res.ok) return null
        const a = new Audio(src)
        a.preload = 'auto'
        a.loop = !!opts.loop
        return a
      } catch {
        return null
      }
    }
    const [bg, click, sweep] = await Promise.all([
      probe(SOURCES.bg, { loop: true }),
      probe(SOURCES.click),
      probe(SOURCES.sweep),
    ])
    bgRef.current = bg
    clickRef.current = click
    sweepRef.current = sweep
    if (!bg) {
      useLofiFallback.current = true
      try {
        lofiRef.current = createLofi()
      } catch {
        /* ignore — older browsers without Web Audio */
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      bgRef.current?.pause()
      bgRef.current = null
      lofiRef.current?.stop()
      lofiRef.current = null
    }
  }, [])

  const applyLevel = useCallback((next: AudioLevel) => {
    const v = VOLUMES[next]
    const bg = bgRef.current
    if (bg) {
      bg.volume = v.bg
      if (next === 'muted') bg.pause()
      else bg.play().catch(() => {})
    } else if (lofiRef.current) {
      if (next === 'muted') {
        lofiRef.current.stop()
      } else {
        lofiRef.current.start()
        lofiRef.current.setVolume(v.bg)
      }
    }
    if (clickRef.current) clickRef.current.volume = v.sfx
    if (sweepRef.current) sweepRef.current.volume = v.sfx
  }, [])

  // Apply level to live elements + persist.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, level)
    } catch {
      /* ignore */
    }
    applyLevel(level)
  }, [level, applyLevel])

  const cycleLevel = useCallback(() => {
    void ensureLoaded().then(() => {
      setLevel((cur) => {
        const next = NEXT[cur]
        applyLevel(next)
        return next
      })
    })
  }, [ensureLoaded, applyLevel])

  const playOneShot = useCallback(
    async (ref: React.MutableRefObject<HTMLAudioElement | null>) => {
      if (level === 'muted') return
      await ensureLoaded()
      const el = ref.current
      if (!el) return
      try {
        el.currentTime = 0
        el.play().catch(() => {})
      } catch {
        /* ignore */
      }
    },
    [level, ensureLoaded],
  )

  const playClick = useCallback(() => {
    void playOneShot(clickRef)
  }, [playOneShot])
  const playSweep = useCallback(() => {
    void playOneShot(sweepRef)
  }, [playOneShot])

  return <Ctx.Provider value={{ level, cycleLevel, playClick, playSweep }}>{children}</Ctx.Provider>
}

export function useAudio() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAudio must be used within AudioProvider')
  return v
}
