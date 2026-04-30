import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & {
  bars: 0 | 2 | 4
}

const ARCS = [
  'M15.5 9.5a3.5 3.5 0 0 1 0 5',
  'M17.5 7.5a6.5 6.5 0 0 1 0 9',
  'M19.5 5.5a9.5 9.5 0 0 1 0 13',
  'M21.5 3.5a12.5 12.5 0 0 1 0 17',
] as const

export function VolumeIcon({ bars, ...rest }: Props) {
  const muted = bars === 0
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        ARCS.slice(0, bars).map((d, i) => <path key={i} d={d} />)
      )}
    </svg>
  )
}
