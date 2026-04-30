import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { Range } from './range'
import { rangeToSince, rangeBuckets } from './range'

type MongoCollection = {
  aggregate: (pipeline: Record<string, unknown>[]) => {
    toArray: () => Promise<Record<string, unknown>[]>
  }
}

async function getPageviewsCollection(): Promise<MongoCollection> {
  const payload: Payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = payload.db as any
  // mongoose adapter exposes `connection` (the native driver) and `collections`
  // (mongoose models). Use the native collection so we can run aggregations.
  const conn = db.connection ?? db.client
  const native = conn?.db?.collection?.('pageviews') as MongoCollection | undefined
  if (native) return native
  const mongoose = db.collections?.pageviews
  if (mongoose?.collection) return mongoose.collection as MongoCollection
  throw new Error('pageviews collection unavailable on payload.db')
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

function dateOnly(field: string) {
  return { $dateToString: { format: '%Y-%m-%d', date: `$${field}` } }
}

const bucketUnit: Record<'hour' | 'day' | 'week' | 'month', string> = {
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
}

export async function getTotals(range: Range): Promise<Totals> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          visits: { $sum: 1 },
          uniqKeys: { $addToSet: { $concat: ['$ipHash', '|', dateOnly('createdAt')] } },
        },
      },
      { $project: { _id: 0, visits: 1, unique: { $size: '$uniqKeys' } } },
    ])
    .toArray()
  const r = (rows[0] ?? { visits: 0, unique: 0 }) as { visits: number; unique: number }
  return { visits: r.visits, unique: r.unique }
}

export async function getTimeseries(range: Range): Promise<TimeseriesPoint[]> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const { bucket } = rangeBuckets(range)
  const unit = bucketUnit[bucket as keyof typeof bucketUnit] ?? 'day'
  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateTrunc: { date: '$createdAt', unit } },
          visits: { $sum: 1 },
          uniqKeys: { $addToSet: { $concat: ['$ipHash', '|', dateOnly('createdAt')] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, d: '$_id', visits: 1, unique: { $size: '$uniqKeys' } } },
    ])
    .toArray()
  return (rows as { d: string | Date; visits: number; unique: number }[]).map((r) => ({
    date: new Date(r.d).toISOString(),
    visits: r.visits,
    unique: r.unique,
  }))
}

export async function getTopCountries(range: Range, limit = 5): Promise<CountryRow[]> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const totals = await getTotals(range)
  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$country',
          visits: { $sum: 1 },
          uniqIps: { $addToSet: '$ipHash' },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: limit },
      { $project: { _id: 0, country: '$_id', visits: 1, unique: { $size: '$uniqIps' } } },
    ])
    .toArray()
  return (rows as { country: string; visits: number; unique: number }[]).map((r) => ({
    country: r.country || 'unknown',
    visits: r.visits,
    unique: r.unique,
    pct: pctOf(r.visits, totals.visits),
  }))
}

export async function getDeviceSplit(range: Range): Promise<DeviceRow[]> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const totals = await getTotals(range)
  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$device', visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $project: { _id: 0, device: '$_id', visits: 1 } },
    ])
    .toArray()
  return (rows as { device: string; visits: number }[]).map((r) => ({
    device: r.device,
    visits: r.visits,
    pct: pctOf(r.visits, totals.visits),
  }))
}

async function splitBy(range: Range, column: 'browser' | 'os'): Promise<SplitRow[]> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const totals = await getTotals(range)
  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: `$${column}`, visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, key: '$_id', visits: 1 } },
    ])
    .toArray()
  return (rows as { key: string; visits: number }[]).map((r) => ({
    key: r.key || 'unknown',
    visits: r.visits,
    pct: pctOf(r.visits, totals.visits),
  }))
}

export const getBrowserSplit = (range: Range) => splitBy(range, 'browser')
export const getOsSplit = (range: Range) => splitBy(range, 'os')

export async function getTopPages(range: Range, limit = 10): Promise<PageRow[]> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$path',
          visits: { $sum: 1 },
          uniqIps: { $addToSet: '$ipHash' },
          lastSeen: { $max: '$createdAt' },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          path: '$_id',
          visits: 1,
          unique: { $size: '$uniqIps' },
          lastSeen: 1,
        },
      },
    ])
    .toArray()
  return (rows as { path: string; visits: number; unique: number; lastSeen: string | Date }[]).map(
    (r) => ({
      path: r.path,
      visits: r.visits,
      unique: r.unique,
      lastSeen: new Date(r.lastSeen).toISOString(),
    }),
  )
}

export async function getTopReferrers(range: Range, limit = 10): Promise<ReferrerRow[]> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const totals = await getTotals(range)
  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since }, referrer: { $exists: true, $nin: [null, ''] } } },
      { $group: { _id: '$referrer', visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: limit },
      { $project: { _id: 0, referrer: '$_id', visits: 1 } },
    ])
    .toArray()
  return (rows as { referrer: string; visits: number }[]).map((r) => ({
    referrer: r.referrer,
    visits: r.visits,
    pct: pctOf(r.visits, totals.visits),
  }))
}

export async function getTopCities(range: Range, limit = 10): Promise<CityRow[]> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since }, city: { $exists: true, $nin: [null, ''] } } },
      {
        $group: {
          _id: { city: '$city', country: '$country' },
          visits: { $sum: 1 },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: limit },
      { $project: { _id: 0, city: '$_id.city', country: '$_id.country', visits: 1 } },
    ])
    .toArray()
  return rows as CityRow[]
}

export async function getRecentEvents(
  range: Range,
  page: number,
  pageSize: number,
): Promise<{ rows: EventRow[]; total: number }> {
  const col = await getPageviewsCollection()
  const since = rangeToSince(range)
  const skip = (page - 1) * pageSize

  const totalRows = await col
    .aggregate([{ $match: { createdAt: { $gte: since } } }, { $count: 'total' }])
    .toArray()
  const total = ((totalRows[0] ?? { total: 0 }) as { total: number }).total

  const rows = await col
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          path: 1,
          country: 1,
          city: 1,
          device: 1,
          browser: 1,
          referrer: 1,
          ipHash: 1,
        },
      },
    ])
    .toArray()

  return {
    rows: (rows as Record<string, unknown>[]).map((r) => ({
      id: String(r._id),
      createdAt: new Date(String(r.createdAt)).toISOString(),
      path: String(r.path ?? ''),
      country: String(r.country ?? ''),
      city: String(r.city ?? ''),
      device: String(r.device ?? ''),
      browser: String(r.browser ?? ''),
      referrer: String(r.referrer ?? ''),
      ipHash: String(r.ipHash ?? ''),
    })),
    total,
  }
}
