import { getPayload } from 'payload'
import config from '@payload-config'
import { isbot } from 'isbot'
import { hashIp } from '@/lib/analytics/ipHash'
import { parseUA } from '@/lib/analytics/ua'
import { rateLimit } from '@/lib/analytics/rateLimit'

export const runtime = 'nodejs'

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return '0.0.0.0'
}

function normalizePath(raw: string): string {
  try {
    const url = new URL(raw, 'http://localhost')
    let p = url.pathname.toLowerCase()
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
    return p
  } catch {
    return '/'
  }
}

function sanitizeReferrer(raw: string | null, host: string | null): string {
  if (!raw) return ''
  try {
    const u = new URL(raw)
    if (host && u.host === host) return ''
    return `${u.origin}${u.pathname}`.slice(0, 512)
  } catch {
    return ''
  }
}

export async function POST(req: Request): Promise<Response> {
  if (!process.env.PAYLOAD_IP_SALT || process.env.PAYLOAD_IP_SALT.length < 32) {
    return new Response('Salt missing', { status: 503 })
  }

  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || isbot(ua)) return new Response(null, { status: 204 })

  const ip = getClientIp(req)
  const limit = rateLimit(ip)
  if (!limit.ok) {
    return new Response('Too many requests', {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSec) },
    })
  }

  let body: { path?: string; referrer?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Bad JSON', { status: 400 })
  }
  if (!body.path || typeof body.path !== 'string') {
    return new Response('Missing path', { status: 400 })
  }

  const path = normalizePath(body.path)
  const referrer = sanitizeReferrer(body.referrer ?? '', req.headers.get('host'))
  const { device, browser, os } = parseUA(ua)
  const ipHash = hashIp(ip)
  const country = req.headers.get('x-vercel-ip-country') ?? 'unknown'
  const city = req.headers.get('x-vercel-ip-city') ?? ''
  const region = req.headers.get('x-vercel-ip-country-region') ?? ''

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'pageviews',
      data: { path, country, city, region, device, browser, os, referrer, ipHash, userAgent: ua },
      overrideAccess: true,
    })
  } catch (err) {
    console.error('[pv] failed to insert', err)
    return new Response(null, { status: 204 })
  }

  return new Response(null, { status: 204 })
}
