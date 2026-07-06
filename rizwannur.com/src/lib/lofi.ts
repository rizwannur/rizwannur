/**
 * A small "welcoming lofi" generator that synthesizes a warm ambient loop in
 * the browser using Web Audio. No file needed, no licensing involved.
 *
 * It layers:
 *   - a soft sine + triangle pad on a 4-chord loop (Cmaj7 → Em7 → Am7 → Fmaj7)
 *   - a low-pass filtered pink-ish noise bed for tape/vinyl warmth
 *   - a subtle slow tremolo to keep it from sounding static
 *
 * Output goes through a master gain node so the caller can ramp volume in/out.
 */

export type LofiHandle = {
  start: () => void
  /**
   * Stop oscillators + ramp gain to 0 but keep the AudioContext alive.
   *
   * On iOS Safari, resuming a suspended AudioContext requires a user
   * gesture. If we suspend the context every time the user mutes (or
   * when the tab backgrounds) we then need a fresh tap to make any
   * sound again — including SFX clicks the user explicitly triggers.
   * Keeping the context running solves that whole class of "second
   * click is silent" bugs.
   */
  silence: () => void
  /** Full teardown — call only on unmount. Suspends the context. */
  stop: () => void
  setVolume: (v: number) => void
  ctx: AudioContext
}

const CHORD_PROGRESSION_HZ: number[][] = [
  // Cmaj7 — soft root
  [261.63, 329.63, 392.0, 493.88],
  // Em7
  [164.81, 196.0, 246.94, 293.66],
  // Am7
  [220.0, 261.63, 329.63, 392.0],
  // Fmaj7
  [174.61, 220.0, 261.63, 329.63],
]

const CHORD_DURATION_S = 4

export function createLofi(): LofiHandle {
  const Ctor: typeof AudioContext =
    (window.AudioContext as typeof AudioContext) ||
    ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  const ctx = new Ctor()

  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  // Tremolo on master — slow LFO modulating gain a touch.
  const tremolo = ctx.createGain()
  tremolo.gain.value = 1
  tremolo.connect(master)
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.18
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.06
  lfo.connect(lfoGain).connect(tremolo.gain)

  // Pink-ish noise bed (filtered white noise).
  const noiseBuffer = makeNoiseBuffer(ctx, 2)
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer
  noise.loop = true
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = 700
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.045
  noise.connect(noiseFilter).connect(noiseGain).connect(tremolo)

  // Pad — for each chord we keep two oscillators per note (sine + triangle one
  // octave down) so the timbre has body without ever being bright.
  const padFilter = ctx.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = 1400
  padFilter.Q.value = 0.6
  padFilter.connect(tremolo)

  let chordOscs: OscillatorNode[] = []
  let chordGain: GainNode | null = null
  let chordTimer: number | null = null
  let started = false

  const playChord = (idx: number) => {
    // Tear down previous chord with a quick fade so transitions don't click.
    if (chordGain) {
      const g = chordGain
      const oldOscs = chordOscs
      g.gain.cancelScheduledValues(ctx.currentTime)
      g.gain.setValueAtTime(g.gain.value, ctx.currentTime)
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
      window.setTimeout(() => {
        oldOscs.forEach((o) => {
          try {
            o.stop()
          } catch {
            /* noop */
          }
        })
      }, 800)
    }

    const g = ctx.createGain()
    g.gain.value = 0
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.6)
    g.connect(padFilter)
    chordGain = g

    const oscs: OscillatorNode[] = []
    for (const hz of CHORD_PROGRESSION_HZ[idx]) {
      const sine = ctx.createOscillator()
      sine.type = 'sine'
      sine.frequency.value = hz
      sine.connect(g)
      sine.start()
      oscs.push(sine)
      const tri = ctx.createOscillator()
      tri.type = 'triangle'
      tri.frequency.value = hz / 2
      const triGain = ctx.createGain()
      triGain.gain.value = 0.5
      tri.connect(triGain).connect(g)
      tri.start()
      oscs.push(tri)
    }
    chordOscs = oscs
  }

  const start = () => {
    if (started) return
    started = true
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    try {
      lfo.start()
      noise.start()
    } catch {
      /* already started */
    }
    let i = 0
    playChord(i)
    chordTimer = window.setInterval(() => {
      i = (i + 1) % CHORD_PROGRESSION_HZ.length
      playChord(i)
    }, CHORD_DURATION_S * 1000)
  }

  const silence = () => {
    if (!started) return
    started = false
    if (chordTimer != null) {
      window.clearInterval(chordTimer)
      chordTimer = null
    }
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)
    // Tear down active chord oscillators after the gain ramp finishes so
    // they don't keep eating CPU on a long-lived context.
    if (chordGain) {
      const oldOscs = chordOscs
      chordOscs = []
      chordGain = null
      window.setTimeout(() => {
        oldOscs.forEach((o) => {
          try { o.stop() } catch { /* noop */ }
        })
      }, 500)
    }
  }

  const stop = () => {
    silence()
    // Full teardown for component unmount. Suspending here is fine
    // because the page is going away — we'll never need to resume.
    window.setTimeout(() => {
      ctx.suspend().catch(() => {})
    }, 600)
  }

  const setVolume = (v: number) => {
    if (ctx.state === 'suspended' && v > 0) ctx.resume().catch(() => {})
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.4)
  }

  return { start, silence, stop, setVolume, ctx }
}

export function playClick(ctx: AudioContext, volume: number) {
  if (volume <= 0) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = 'square'
  osc.frequency.setValueAtTime(1800, now)
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.04)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2200
  filter.Q.value = 4
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(volume, now + 0.002)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
  osc.connect(filter).connect(g).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.08)
}

export function playSweep(ctx: AudioContext, volume: number) {
  if (volume <= 0) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  const now = ctx.currentTime
  const dur = 0.35
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(1320, now + dur)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(800, now)
  filter.frequency.exponentialRampToValueAtTime(4000, now + dur)
  filter.Q.value = 1.2
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(volume * 0.6, now + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  osc.connect(filter).connect(g).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + dur + 0.05)
}

function makeNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  // Voss-McCartney-ish pink noise approximation
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    b3 = 0.8665 * b3 + white * 0.3104856
    b4 = 0.55 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.016898
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
    b6 = white * 0.115926
  }
  return buffer
}
