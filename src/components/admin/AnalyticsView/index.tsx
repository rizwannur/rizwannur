import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import { parseRange, RANGE_LABELS } from '@/lib/analytics/range'
import { getTimeseries, getTopCountries, getTopCities, getDeviceSplit, getBrowserSplit, getOsSplit, getTopPages, getTopReferrers } from '@/lib/analytics/aggregate'
import { RangeSelector } from './RangeSelector'
import { Timeseries } from './Timeseries'
import { GeoTables } from './GeoTables'
import { DeviceCharts } from './DeviceCharts'
import { TopPages } from './TopPages'
import { TopReferrers } from './TopReferrers'

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
}

export default async function AnalyticsView({ initPageResult }: AdminViewServerProps) {
  const params = initPageResult?.req?.query as Record<string, string | undefined> | undefined
  const range = parseRange(params?.range)

  const timeseries = await getTimeseries(range)

  const [countries, cities] = await Promise.all([
    getTopCountries(range, 25),
    getTopCities(range, 25),
  ])

  const [devices, browsers, os] = await Promise.all([
    getDeviceSplit(range),
    getBrowserSplit(range),
    getOsSplit(range),
  ])

  const pages = await getTopPages(range, 25)

  const referrers = await getTopReferrers(range, 25)

  const vercelTeam = process.env.NEXT_PUBLIC_VERCEL_TEAM_SLUG ?? ''
  const vercelProject = process.env.NEXT_PUBLIC_VERCEL_PROJECT_NAME ?? ''
  const vercelHref =
    vercelTeam && vercelProject
      ? `https://vercel.com/${vercelTeam}/${vercelProject}/analytics`
      : 'https://vercel.com/dashboard'

  return (
    <Gutter>
      <header style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Analytics — {RANGE_LABELS[range]}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <RangeSelector value={range} />
          <a
            href={vercelHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid var(--theme-elevation-150)',
              textDecoration: 'none',
            }}
          >
            Open in Vercel ↗
          </a>
        </div>
      </header>

      <Timeseries data={timeseries} />
      <GeoTables countries={countries} cities={cities} />
      <DeviceCharts devices={devices} browsers={browsers} os={os} />
      <TopPages pages={pages} />
      <TopReferrers referrers={referrers} />
    </Gutter>
  )
}
