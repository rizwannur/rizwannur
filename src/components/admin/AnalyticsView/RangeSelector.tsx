'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { RANGES, RANGE_LABELS, type Range } from '@/lib/analytics/range'

export function RangeSelector({ value }: { value: Range }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (next: Range) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('range', next)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Range)}
      style={{
        padding: '6px 10px',
        borderRadius: 6,
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-input-bg)',
        color: 'var(--theme-text)',
        fontSize: 13,
      }}
    >
      {RANGES.map((r) => (
        <option key={r} value={r}>
          {RANGE_LABELS[r]}
        </option>
      ))}
    </select>
  )
}
