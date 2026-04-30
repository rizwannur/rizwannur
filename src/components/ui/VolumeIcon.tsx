import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & {
  bars: 0 | 2 | 4
}

// 4 concentric quarter-circle arcs centered at (12, 12), spanning -45° to +45°.
// Each arc starts at top-right and sweeps clockwise to bottom-right.
// dy = r * sqrt(2), startX = 12 + r * cos(45°), startY = 12 - r * sin(45°)
const ARCS = [
  { d: 'M14.12 9.88 a3 3 0 0 1 0 4.24', sw: 1.8 },
  { d: 'M15.89 8.11 a5.5 5.5 0 0 1 0 7.78', sw: 1.7 },
  { d: 'M17.66 6.34 a8 8 0 0 1 0 11.31', sw: 1.6 },
  { d: 'M19.42 4.58 a10.5 10.5 0 0 1 0 14.85', sw: 1.5 },
] as const

export function VolumeIcon({ bars, ...rest }: Props) {
  const muted = bars === 0
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        ARCS.slice(0, bars).map((arc, i) => (
          <path key={i} d={arc.d} strokeWidth={arc.sw} fill="none" />
        ))
      )}
    </svg>
  )
}
