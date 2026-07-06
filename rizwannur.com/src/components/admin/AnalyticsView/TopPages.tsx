import type { PageRow } from '@/lib/analytics/aggregate'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
  marginBottom: 24,
}

export function TopPages({ pages }: { pages: PageRow[] }) {
  return (
    <section style={cardStyle}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Top pages</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', opacity: 0.7 }}>Path</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', opacity: 0.7 }}>Visits</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', opacity: 0.7 }}>Unique</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', opacity: 0.7 }}>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.path}>
              <td style={{ padding: '6px 8px', borderTop: '1px solid var(--theme-elevation-100)' }}>{p.path}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', borderTop: '1px solid var(--theme-elevation-100)' }}>{p.visits}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', borderTop: '1px solid var(--theme-elevation-100)' }}>{p.unique}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', borderTop: '1px solid var(--theme-elevation-100)' }}>
                {new Date(p.lastSeen).toLocaleString()}
              </td>
            </tr>
          ))}
          {pages.length === 0 && (
            <tr>
              <td style={{ padding: '6px 8px' }} colSpan={4}>No data yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}
