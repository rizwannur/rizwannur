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
  const levelRef = useRef<AudioLevel>('muted')
  const bgRef = useRef<HTMLAudioElement | null>(null)
  const clickRef = useRef<HTMLAudioElement | null>(null)
  const sweepRef = useRef<HTMLAudioElement | null>(null)
  const lofiRef = useRef<LofiHandle | null>(null)
  const useLofiFallback = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AudioLevel | null
      if (saved && saved in VOLUMES) setLevel(saved)
    } catch { /* ignore */ }
  }, [])

  // Synchronous gesture-time unlock. iOS WKWebView (Instagram, Threads, FB
  // in-app browsers) requires the AudioContext to be created AND resumed
  // inside the user-gesture callstack — not after an awaited fetch. So we
  // build the lofi fallback synchronously here, then probe asset files
  // asynchronously in the background.
  const initialized = useRef(false)
  const initSync = useCallback(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      lofiRef.current = createLofi()
      lofiRef.current.ctx.resume().catch(() => {})
      useLofiFallback.current = true
    } catch { /* ignore */ }

    void (async () => {
      const probe = async (src: string, opts: { loop?: boolean } = {}) => {
        try {
          const res = await fetch(src, { method: 'HEAD' })
          if (!res.ok) return null
          const a = new Audio(src)
          a.preload = 'auto'
          a.loop = !!opts.loop
          a.setAttribute('playsinline', '')
          a.setAttribute('webkit-playsinline', '')
          return a
        } catch { return null }
      }
      const [bg, click, sweep] = await Promise.all([
        probe(SOURCES.bg, { loop: true }),
        probe(SOURCES.click),
        probe(SOURCES.sweep),
      ])
      if (click) clickRef.current = click
      if (sweep) sweepRef.current = sweep
      if (bg) {
        bgRef.current = bg
        useLofiFallback.current = false
        applyLevelRef.current?.()
      }
    })()
  }, [])

  // Stable ref so the async probe block above can re-apply current level
  // without depending on a moving applyLevel callback identity.
  const applyLevelRef = useRef<(() => void) | null>(null)

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
    if (bg && !useLofiFallback.current) {
      bg.volume = v.bg
      if (next === 'muted') bg.pause()
      else bg.play().catch(() => {})
      lofiRef.current?.stop()
    } else if (lofiRef.current) {
      if (next === 'muted') { lofiRef.current.stop() }
      else {
        lofiRef.current.ctx.resume().catch(() => {})
        lofiRef.current.start()
        lofiRef.current.setVolume(v.bg)
      }
    }
    if (clickRef.current) clickRef.current.volume = v.sfx
    if (sweepRef.current) sweepRef.current.volume = v.sfx
  }, [])

  applyLevelRef.current = () => applyLevel(levelRef.current)

  useEffect(() => {
    levelRef.current = level
    try { localStorage.setItem(STORAGE_KEY, level) } catch { /* ignore */ }
    applyLevel(level)
  }, [level, applyLevel])

  const cycleLevel = useCallback(() => {
    initSync()
    setLevel((cur) => {
      const next = NEXT[cur]
      applyLevel(next)
      return next
    })
  }, [initSync, applyLevel])

  const playOneShot = useCallback(
    (ref: React.MutableRefObject<HTMLAudioElement | null>) => {
      if (levelRef.current === 'muted') return
      initSync()
      const el = ref.current
      if (!el) return
      try { el.currentTime = 0; el.play().catch(() => {}) } catch { /* ignore */ }
    },
    [initSync],
  )

  const playClick = useCallback(() => { playOneShot(clickRef) }, [playOneShot])
  const playSweep = useCallback(() => { playOneShot(sweepRef) }, [playOneShot])

  return <Ctx.Provider value={{ level, cycleLevel, playClick, playSweep }}>{children}</Ctx.Provider>
}

export function useAudio() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAudio must be used within AudioProvider')
  return v
}
