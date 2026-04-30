import type { ReferrerRow } from '@/lib/analytics/aggregate'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
  marginBottom: 24,
}

export function TopReferrers({ referrers }: { referrers: ReferrerRow[] }) {
  return (
    <section style={cardStyle}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Top referrers</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', opacity: 0.7 }}>Referrer</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', opacity: 0.7 }}>Visits</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', opacity: 0.7 }}>%</th>
          </tr>
        </thead>
        <tbody>
          {referrers.map((r) => (
            <tr key={r.referrer}>
              <td style={{ padding: '6px 8px', borderTop: '1px solid var(--theme-elevation-100)' }}>
                <a href={r.referrer} target="_blank" rel="noopener noreferrer">
                  {r.referrer}
                </a>
              </td>
              <td style={{ padding: '6px 8px', textAlign: 'right', borderTop: '1px solid var(--theme-elevation-100)' }}>
                {r.visits}
              </td>
              <td style={{ padding: '6px 8px', textAlign: 'right', borderTop: '1px solid var(--theme-elevation-100)' }}>
                {r.pct}%
              </td>
            </tr>
          ))}
          {referrers.length === 0 && (
            <tr>
              <td style={{ padding: '6px 8px' }} colSpan={3}>
                No referrers yet (direct traffic only)
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}
