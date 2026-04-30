import { parseUA } from '@/lib/analytics/ua'
import { hashIp } from '@/lib/analytics/ipHash'
import { parseRange, rangeToSince } from '@/lib/analytics/range'
import { rateLimit } from '@/lib/analytics/rateLimit'

process.env.PAYLOAD_IP_SALT ??= 'a'.repeat(40)

const desktop = parseUA(
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
)
console.log('desktop:', desktop)
if (desktop.device !== 'desktop') throw new Error('expected desktop')

const mobile = parseUA(
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
)
console.log('mobile:', mobile)
if (mobile.device !== 'mobile') throw new Error('expected mobile')

const a = hashIp('1.2.3.4')
const b = hashIp('1.2.3.4')
const c = hashIp('1.2.3.5')
console.log('hashes:', a.slice(0, 8), b.slice(0, 8), c.slice(0, 8))
if (a !== b) throw new Error('hash should be deterministic')
if (a === c) throw new Error('different IPs should hash differently')

const r = parseRange('30d')
console.log('range:', r, 'since:', rangeToSince(r))
if (r !== '30d') throw new Error('expected 30d')

const allow1 = rateLimit('test')
const allow2 = rateLimit('test')
console.log('rateLimit:', allow1.ok, allow2.ok)
if (!allow1.ok || !allow2.ok) throw new Error('first calls should be allowed')

console.log('OK')
