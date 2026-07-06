import Link from 'next/link'
import {
  getTotals,
  getTimeseries,
  getTopCountries,
  getDeviceSplit,
  getTopPages,
} from '@/lib/analytics/aggregate'
import { parseRange, RANGE_LABELS } from '@/lib/analytics/range'
import { flagEmoji, countryName } from '@/lib/analytics/country'
import { RangeSelector } from '@/components/admin/AnalyticsView/RangeSelector'
import { ChartClient } from './ChartClient'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
  background: 'var(--theme-elevation-0)',
}

const tileStyle: React.CSSProperties = {
  ...cardStyle,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

export default async function BeforeDashboard({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const range = parseRange(typeof sp.range === 'string' ? sp.range : undefined)

  const [totals, timeseries, countries, devices, pages] = await Promise.all([
    getTotals(range),
    getTimeseries(range),
    getTopCountries(range, 3),
    getDeviceSplit(range),
    getTopPages(range, 3),
  ])

  const topCountry = countries[0]
  const topDevice = devices[0]

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 16,
        border: '1px solid var(--theme-elevation-100)',
        borderRadius: 8,
        background: 'var(--theme-elevation-50)',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16 }}>Analytics — {RANGE_LABELS[range].toLowerCase()}</h2>
        <RangeSelector value={range} />
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ ...cardStyle, minWidth: 0 }}>
          <ChartClient data={timeseries} />
        </div>
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: 8 }}>
          <div style={tileStyle}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>Visits</span>
            <strong style={{ fontSize: 20 }}>{totals.visits.toLocaleString()}</strong>
          </div>
          <div style={tileStyle}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>Unique</span>
            <strong style={{ fontSize: 20 }}>{totals.unique.toLocaleString()}</strong>
          </div>
          <div style={tileStyle}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>Top country</span>
            <strong style={{ fontSize: 16 }}>
              {topCountry
                ? `${flagEmoji(topCountry.country)} ${countryName(topCountry.country)} ${topCountry.pct}%`
                : '—'}
            </strong>
          </div>
          <div style={tileStyle}>
            <span style={{ fontSize: 11, opacity: 0.7 }}>Top device</span>
            <strong style={{ fontSize: 16 }}>
              {topDevice ? `${topDevice.device} ${topDevice.pct}%` : '—'}
            </strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Top countries</h3>
          {countries.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, opacity: 0.6 }}>No data yet</p>
          ) : (
            countries.map((c) => (
              <div
                key={c.country}
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
              >
                <span>
                  <span style={{ marginRight: 6 }}>{flagEmoji(c.country)}</span>
                  {countryName(c.country)}
                </span>
                <span>
                  {c.visits} <span style={{ opacity: 0.6 }}>({c.pct}%)</span>
                </span>
              </div>
            ))
          )}
        </div>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Devices</h3>
          {devices.map((d) => (
            <div
              key={d.device}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
            >
              <span>{d.device}</span>
              <span>
                {d.visits} <span style={{ opacity: 0.6 }}>({d.pct}%)</span>
              </span>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Top pages</h3>
          {pages.map((p) => (
            <div
              key={p.path}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.path}</span>
              <span>{p.visits}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Link
          href={`/admin/analytics?range=${range}`}
          style={{ fontSize: 13, textDecoration: 'underline' }}
        >
          View full analytics →
        </Link>
      </div>
    </section>
  )
}
