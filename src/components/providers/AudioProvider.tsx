'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createLofi, playClick as synthClick, playSweep as synthSweep, type LofiHandle } from '@/lib/lofi'

export type AudioLevel = 'muted' | 'low' | 'high'

type AudioContextValue = {
  level: AudioLevel
  cycleLevel: () => void
  playClick: () => void
  playSweep: () => void
}

const Ctx = createContext<AudioContextValue | null>(null)

const STORAGE_KEY = 'site:audio-level'

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
  const lofiRef = useRef<LofiHandle | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AudioLevel | null
      if (saved && saved in VOLUMES) setLevel(saved)
    } catch { /* ignore */ }
  }, [])

  // iOS Safari: AudioContext must be created AND resumed inside the user-gesture
  // callstack — not after any awaited work. Build everything synthetically so no
  // network probes break the gesture chain.
  const initialized = useRef(false)
  const initSync = useCallback(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      lofiRef.current = createLofi()
      lofiRef.current.ctx.resume().catch(() => {})
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    return () => {
      lofiRef.current?.stop()
      lofiRef.current = null
    }
  }, [])

  const applyLevel = useCallback((next: AudioLevel) => {
    const v = VOLUMES[next]
    const lofi = lofiRef.current
    if (!lofi) return
    if (next === 'muted') {
      lofi.stop()
    } else {
      lofi.ctx.resume().catch(() => {})
      lofi.start()
      lofi.setVolume(v.bg)
    }
  }, [])

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

  const playClick = useCallback(() => {
    if (levelRef.current === 'muted') return
    initSync()
    const ctx = lofiRef.current?.ctx
    if (!ctx) return
    synthClick(ctx, VOLUMES[levelRef.current].sfx)
  }, [initSync])

  const playSweep = useCallback(() => {
    if (levelRef.current === 'muted') return
    initSync()
    const ctx = lofiRef.current?.ctx
    if (!ctx) return
    synthSweep(ctx, VOLUMES[levelRef.current].sfx)
  }, [initSync])

  return <Ctx.Provider value={{ level, cycleLevel, playClick, playSweep }}>{children}</Ctx.Provider>
}

export function useAudio() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAudio must be used within AudioProvider')
  return v
}
