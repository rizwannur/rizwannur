import {
  getTotals,
  getTimeseries,
  getTopCountries,
  getDeviceSplit,
  getTopPages,
  getTopReferrers,
  getRecentEvents,
} from '@/lib/analytics/aggregate'

const range = '7d' as const

console.log('totals:', await getTotals(range))
console.log('timeseries:', (await getTimeseries(range)).slice(0, 3))
console.log('countries:', await getTopCountries(range, 5))
console.log('devices:', await getDeviceSplit(range))
console.log('pages:', await getTopPages(range, 5))
console.log('referrers:', await getTopReferrers(range, 5))
const events = await getRecentEvents(range, 1, 5)
console.log('events page 1:', { count: events.rows.length, total: events.total })

console.log('OK')

export {}
