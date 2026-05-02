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
  const initialized = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AudioLevel | null
      if (saved && saved in VOLUMES) setLevel(saved)
    } catch { /* ignore */ }
  }, [])

  // iOS Safari: AudioContext must be created AND resumed inside the user-
  // gesture callstack — synchronously, no awaits. Any function that fires
  // sound calls initSync first so the context exists by the time we touch
  // it. The global gesture listener below also primes initSync on the
  // very first tap / key on the page, so even users whose first interaction
  // is a Link have the context ready when they later toggle audio.
  const applyLevelRef = useRef<(level: AudioLevel) => void>(() => {})

  const initSync = useCallback(() => {
    if (initialized.current) return
    try {
      const handle = createLofi()
      handle.ctx.resume().catch(() => {})
      lofiRef.current = handle
      initialized.current = true
      // Apply whatever level the user already chose (e.g. restored from
      // localStorage) now that we finally have the audio context.
      applyLevelRef.current(levelRef.current)
    } catch { /* ignore */ }
  }, [])

  const applyLevel = useCallback((next: AudioLevel) => {
    const lofi = lofiRef.current
    if (!lofi) return
    if (next === 'muted') {
      lofi.silence()
    } else {
      // Resume is a no-op if already running. On iOS, it only succeeds
      // inside a user gesture — which is fine because applyLevel is
      // called from cycleLevel (a click handler) and from initSync (also
      // a gesture).
      if (lofi.ctx.state === 'suspended') lofi.ctx.resume().catch(() => {})
      lofi.start()
      lofi.setVolume(VOLUMES[next].bg)
    }
  }, [])

  // Keep ref in sync so initSync (which has a stable identity) can call
  // the latest applyLevel.
  useEffect(() => {
    applyLevelRef.current = applyLevel
  }, [applyLevel])

  useEffect(() => {
    levelRef.current = level
    try { localStorage.setItem(STORAGE_KEY, level) } catch { /* ignore */ }
    applyLevel(level)
  }, [level, applyLevel])

  // Global first-gesture unlock. Without this, the audio context only
  // initialises when the user clicks one of the audio-aware buttons. If
  // their first tap is on a regular Link (the common case), iOS Safari
  // has by then lost the gesture chain and the next click on the audio
  // pill silently fails to resume the context. Listening once at the
  // document level guarantees the context exists before any specific
  // audio-related interaction.
  useEffect(() => {
    if (initialized.current) return
    const unlock = () => initSync()
    const opts: AddEventListenerOptions = { once: true, passive: true, capture: true }
    document.addEventListener('pointerdown', unlock, opts)
    document.addEventListener('touchstart', unlock, opts)
    document.addEventListener('keydown', unlock, opts)
    return () => {
      document.removeEventListener('pointerdown', unlock, opts)
      document.removeEventListener('touchstart', unlock, opts)
      document.removeEventListener('keydown', unlock, opts)
    }
  }, [initSync])

  // Visibility handling.
  //
  // - When the tab is hidden, silence the lofi loop ourselves. iOS will
  //   auto-suspend the AudioContext anyway, but our setInterval for
  //   chord changes keeps ticking under throttling and would fire in
  //   bursts on return, causing audible glitches.
  // - When the tab is visible again, attempt to resume. If the browser
  //   demands a user gesture, this will silently fail and the next tap
  //   will recover.
  useEffect(() => {
    const onVis = () => {
      const lofi = lofiRef.current
      if (!lofi) return
      if (document.visibilityState === 'hidden') {
        lofi.silence()
      } else if (levelRef.current !== 'muted') {
        if (lofi.ctx.state === 'suspended') lofi.ctx.resume().catch(() => {})
        lofi.start()
        lofi.setVolume(VOLUMES[levelRef.current].bg)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    return () => {
      lofiRef.current?.stop()
      lofiRef.current = null
    }
  }, [])

  const cycleLevel = useCallback(() => {
    initSync()
    setLevel((cur) => NEXT[cur])
  }, [initSync])

  const playClick = useCallback(() => {
    if (levelRef.current === 'muted') return
    initSync()
    const lofi = lofiRef.current
    if (!lofi) return
    if (lofi.ctx.state === 'suspended') lofi.ctx.resume().catch(() => {})
    synthClick(lofi.ctx, VOLUMES[levelRef.current].sfx)
  }, [initSync])

  const playSweep = useCallback(() => {
    if (levelRef.current === 'muted') return
    initSync()
    const lofi = lofiRef.current
    if (!lofi) return
    if (lofi.ctx.state === 'suspended') lofi.ctx.resume().catch(() => {})
    synthSweep(lofi.ctx, VOLUMES[levelRef.current].sfx)
  }, [initSync])

  return <Ctx.Provider value={{ level, cycleLevel, playClick, playSweep }}>{children}</Ctx.Provider>
}

export function useAudio() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAudio must be used within AudioProvider')
  return v
}
