import Link from 'next/link'
import type { EventRow } from '@/lib/analytics/aggregate'
import type { Range } from '@/lib/analytics/range'
import { flagEmoji } from '@/lib/analytics/country'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
  marginBottom: 24,
}
const cellStyle: React.CSSProperties = { padding: '6px 8px', borderTop: '1px solid var(--theme-elevation-100)' }

export function RecentEvents({
  rows,
  total,
  page,
  pageSize,
  range,
}: {
  rows: EventRow[]
  total: number
  page: number
  pageSize: number
  range: Range
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section style={cardStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 13 }}>Recent events ({total.toLocaleString()})</h3>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          Page {page} of {totalPages}
        </span>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {['Time', 'Path', 'Country', 'City', 'Device', 'Browser', 'Referrer', 'IP hash'].map(
              (h) => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', opacity: 0.7 }}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={cellStyle}>{new Date(r.createdAt).toLocaleString()}</td>
              <td style={cellStyle}>{r.path}</td>
              <td style={cellStyle}>
                <span style={{ marginRight: 4 }}>{flagEmoji(r.country)}</span>
                {r.country || '—'}
              </td>
              <td style={cellStyle}>{r.city}</td>
              <td style={cellStyle}>{r.device}</td>
              <td style={cellStyle}>{r.browser}</td>
              <td style={cellStyle}>
                {r.referrer ? (
                  <a href={r.referrer} target="_blank" rel="noopener noreferrer">
                    {new URL(r.referrer).host}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td style={{ ...cellStyle, fontFamily: 'monospace' }}>{r.ipHash.slice(0, 8)}…</td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {page > 1 && (
          <Link href={`/admin/analytics?range=${range}&page=${page - 1}`} style={{ fontSize: 12 }}>
            ← Prev
          </Link>
        )}
        {page < totalPages && (
          <Link href={`/admin/analytics?range=${range}&page=${page + 1}`} style={{ fontSize: 12 }}>
            Next →
          </Link>
        )}
      </nav>
    </section>
  )
}
