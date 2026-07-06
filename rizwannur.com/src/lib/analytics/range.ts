export type Range = '24h' | '7d' | '30d' | '90d'

export const RANGES: Range[] = ['24h', '7d', '30d', '90d']

export const RANGE_LABELS: Record<Range, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

export function parseRange(value: string | undefined | null): Range {
  return (RANGES as string[]).includes(value ?? '') ? (value as Range) : '7d'
}

export function rangeToSince(range: Range): Date {
  const now = Date.now()
  const ms =
    range === '24h'
      ? 24 * 60 * 60 * 1000
      : range === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : range === '30d'
          ? 30 * 24 * 60 * 60 * 1000
          : 90 * 24 * 60 * 60 * 1000
  return new Date(now - ms)
}

export function rangeBuckets(range: Range): { bucket: 'hour' | 'day'; count: number } {
  if (range === '24h') return { bucket: 'hour', count: 24 }
  if (range === '7d') return { bucket: 'day', count: 7 }
  if (range === '30d') return { bucket: 'day', count: 30 }
  return { bucket: 'day', count: 90 }
}
