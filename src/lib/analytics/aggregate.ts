import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres/drizzle'
import type { Range } from './range'
import { rangeToSince, rangeBuckets } from './range'

async function getDb() {
  const payload: Payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drizzle = (payload.db as any).drizzle as {
    execute: (q: ReturnType<typeof sql>) => Promise<{ rows: unknown[] }>
  }
  return drizzle
}

export type TimeseriesPoint = { date: string; visits: number; unique: number }
export type Totals = { visits: number; unique: number }
export type CountryRow = { country: string; visits: number; unique: number; pct: number }
export type DeviceRow = { device: string; visits: number; pct: number }
export type PageRow = { path: string; visits: number; unique: number; lastSeen: string }
export type ReferrerRow = { referrer: string; visits: number; pct: number }
export type SplitRow = { key: string; visits: number; pct: number }
export type CityRow = { city: string; country: string; visits: number }
export type EventRow = {
  id: string
  createdAt: string
  path: string
  country: string
  city: string
  device: string
  browser: string
  referrer: string
  ipHash: string
}

function pctOf(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 1000) / 10
}

export async function getTotals(range: Range): Promise<Totals> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const { rows } = await db.execute(
    sql`SELECT COUNT(*)::int AS visits,
               COUNT(DISTINCT ip_hash || '|' || DATE(created_at))::int AS uniq
        FROM pageviews
        WHERE created_at >= ${since}`,
  )
  const r = (rows[0] ?? { visits: 0, uniq: 0 }) as { visits: number; uniq: number }
  return { visits: r.visits, unique: r.uniq }
}

export async function getTimeseries(range: Range): Promise<TimeseriesPoint[]> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const { bucket } = rangeBuckets(range)
  const { rows } = await db.execute(
    sql`SELECT date_trunc(${bucket}, created_at) AS d,
               COUNT(*)::int AS visits,
               COUNT(DISTINCT ip_hash || '|' || DATE(created_at))::int AS uniq
        FROM pageviews
        WHERE created_at >= ${since}
        GROUP BY d
        ORDER BY d ASC`,
  )
  return (rows as { d: string; visits: number; uniq: number }[]).map((r) => ({
    date: new Date(r.d).toISOString(),
    visits: r.visits,
    unique: r.uniq,
  }))
}

export async function getTopCountries(range: Range, limit = 5): Promise<CountryRow[]> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const totals = await getTotals(range)
  const { rows } = await db.execute(
    sql`SELECT country,
               COUNT(*)::int AS visits,
               COUNT(DISTINCT ip_hash)::int AS uniq
        FROM pageviews
        WHERE created_at >= ${since}
        GROUP BY country
        ORDER BY visits DESC
        LIMIT ${limit}`,
  )
  return (rows as { country: string; visits: number; uniq: number }[]).map((r) => ({
    country: r.country || 'unknown',
    visits: r.visits,
    unique: r.uniq,
    pct: pctOf(r.visits, totals.visits),
  }))
}

export async function getDeviceSplit(range: Range): Promise<DeviceRow[]> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const totals = await getTotals(range)
  const { rows } = await db.execute(
    sql`SELECT device, COUNT(*)::int AS visits
        FROM pageviews WHERE created_at >= ${since}
        GROUP BY device ORDER BY visits DESC`,
  )
  return (rows as { device: string; visits: number }[]).map((r) => ({
    device: r.device,
    visits: r.visits,
    pct: pctOf(r.visits, totals.visits),
  }))
}

async function splitBy(range: Range, column: 'browser' | 'os'): Promise<SplitRow[]> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const totals = await getTotals(range)
  const colSql = column === 'browser' ? sql`browser` : sql`os`
  const { rows } = await db.execute(
    sql`SELECT ${colSql} AS k, COUNT(*)::int AS visits
        FROM pageviews WHERE created_at >= ${since}
        GROUP BY ${colSql} ORDER BY visits DESC LIMIT 10`,
  )
  return (rows as { k: string; visits: number }[]).map((r) => ({
    key: r.k || 'unknown',
    visits: r.visits,
    pct: pctOf(r.visits, totals.visits),
  }))
}

export const getBrowserSplit = (range: Range) => splitBy(range, 'browser')
export const getOsSplit = (range: Range) => splitBy(range, 'os')

export async function getTopPages(range: Range, limit = 10): Promise<PageRow[]> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const { rows } = await db.execute(
    sql`SELECT path,
               COUNT(*)::int AS visits,
               COUNT(DISTINCT ip_hash)::int AS uniq,
               MAX(created_at) AS last_seen
        FROM pageviews WHERE created_at >= ${since}
        GROUP BY path ORDER BY visits DESC LIMIT ${limit}`,
  )
  return (rows as { path: string; visits: number; uniq: number; last_seen: string }[]).map(
    (r) => ({ path: r.path, visits: r.visits, unique: r.uniq, lastSeen: r.last_seen }),
  )
}

export async function getTopReferrers(range: Range, limit = 10): Promise<ReferrerRow[]> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const totals = await getTotals(range)
  const { rows } = await db.execute(
    sql`SELECT referrer, COUNT(*)::int AS visits
        FROM pageviews
        WHERE created_at >= ${since} AND COALESCE(referrer, '') <> ''
        GROUP BY referrer ORDER BY visits DESC LIMIT ${limit}`,
  )
  return (rows as { referrer: string; visits: number }[]).map((r) => ({
    referrer: r.referrer,
    visits: r.visits,
    pct: pctOf(r.visits, totals.visits),
  }))
}

export async function getTopCities(range: Range, limit = 10): Promise<CityRow[]> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const { rows } = await db.execute(
    sql`SELECT city, country, COUNT(*)::int AS visits
        FROM pageviews
        WHERE created_at >= ${since} AND COALESCE(city, '') <> ''
        GROUP BY city, country ORDER BY visits DESC LIMIT ${limit}`,
  )
  return rows as CityRow[]
}

export async function getRecentEvents(
  range: Range,
  page: number,
  pageSize: number,
): Promise<{ rows: EventRow[]; total: number }> {
  const db = await getDb()
  const since = rangeToSince(range).toISOString()
  const offset = (page - 1) * pageSize
  const totalRes = await db.execute(
    sql`SELECT COUNT(*)::int AS total FROM pageviews WHERE created_at >= ${since}`,
  )
  const total = ((totalRes.rows[0] ?? { total: 0 }) as { total: number }).total
  const { rows } = await db.execute(
    sql`SELECT id, created_at, path, country, city, device, browser, referrer, ip_hash
        FROM pageviews
        WHERE created_at >= ${since}
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}`,
  )
  return {
    rows: (rows as Record<string, unknown>[]).map((r) => ({
      id: String(r.id),
      createdAt: String(r.created_at),
      path: String(r.path),
      country: String(r.country ?? ''),
      city: String(r.city ?? ''),
      device: String(r.device),
      browser: String(r.browser ?? ''),
      referrer: String(r.referrer ?? ''),
      ipHash: String(r.ip_hash),
    })),
    total,
  }
}
