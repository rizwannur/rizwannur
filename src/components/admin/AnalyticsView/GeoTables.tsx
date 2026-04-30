import type { CountryRow, CityRow } from '@/lib/analytics/aggregate'
import { flagEmoji, countryName } from '@/lib/analytics/country'

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
}
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  borderBottom: '1px solid var(--theme-elevation-150)',
  fontSize: 11,
  opacity: 0.7,
  fontWeight: 500,
}
const tdStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderBottom: '1px solid var(--theme-elevation-100)',
}
const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
}

export function GeoTables({ countries, cities }: { countries: CountryRow[]; cities: CityRow[] }) {
  return (
    <section style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Countries</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>Visits</th>
              <th style={thStyle}>Unique</th>
              <th style={thStyle}>%</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.country}>
                <td style={tdStyle}>
                  <span style={{ marginRight: 6 }}>{flagEmoji(c.country)}</span>
                  {countryName(c.country)}
                </td>
                <td style={tdStyle}>{c.visits}</td>
                <td style={tdStyle}>{c.unique}</td>
                <td style={tdStyle}>{c.pct}%</td>
              </tr>
            ))}
            {countries.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={4}>
                  No data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Cities</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>Visits</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={`${c.city}|${c.country}`}>
                <td style={tdStyle}>{c.city}</td>
                <td style={tdStyle}>
                  <span style={{ marginRight: 6 }}>{flagEmoji(c.country)}</span>
                  {countryName(c.country)}
                </td>
                <td style={tdStyle}>{c.visits}</td>
              </tr>
            ))}
            {cities.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={3}>
                  No data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
