# Payload Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-hosted pageview logger that powers a chart + breakdown panels on `/admin` (above the default Payload cards) and a deeper view at `/admin/analytics`. Keeps `@vercel/analytics` running so Vercel's own dashboard still works.

**Architecture:** Public site fires `POST /api/pv` from a `<Track />` client component on every route change. Route handler hashes the IP, parses the UA, derives country/city from `x-vercel-ip-*` headers, and writes a row to a `pageviews` Payload collection. Admin RSCs read aggregates via Payload's Drizzle adapter and pass numbers to Recharts client components for visualization.

**Tech Stack:** Next.js 16 App Router, Payload 3.84, Postgres (via `@payloadcms/db-postgres`), Recharts, `@vercel/analytics`, `isbot`, `ua-parser-js`. Bun as package manager and runtime.

**Verification approach:** This codebase has no test runner. Each task verifies via:
1. Inline smoke script (`bun run scripts/<name>.ts`) for backend pieces
2. `bun run type-check` and `bun run lint` clean
3. Manual visit to `/admin` / `/admin/analytics` for UI tasks
A test framework can be added in a follow-up; not in scope here.

**Spec:** [docs/superpowers/specs/2026-04-30-payload-analytics-dashboard-design.md](../specs/2026-04-30-payload-analytics-dashboard-design.md)

---

## Task 1: Setup — install dependencies and add env var

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Modify: `.env` (locally, never committed)

- [ ] **Step 1: Install runtime dependencies**

```bash
bun add @vercel/analytics recharts isbot ua-parser-js
```

Expected: `package.json` updates with the four packages, `bun.lock` updated.

- [ ] **Step 2: Generate a salt and add to `.env`**

```bash
echo "PAYLOAD_IP_SALT=$(openssl rand -hex 32)" >> .env
```

If `openssl` isn't available, generate any random ≥32-char string and paste it manually.

- [ ] **Step 3: Document the env var in `.env.example`**

Add this block at the bottom of `.env.example` (create the file if it doesn't exist):

```
# Salt used when hashing visitor IPs for analytics dedup.
# Must be ≥32 chars. Set on every environment (local, preview, prod).
# Rotating invalidates unique-visitor counts across the rotation.
PAYLOAD_IP_SALT=
```

- [ ] **Step 4: Verify install**

```bash
bun run type-check
```

Expected: PASS (no errors yet — we haven't written code).

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock .env.example
git commit -m "chore(analytics): install deps and document PAYLOAD_IP_SALT"
```

---

## Task 2: Pageviews collection + migration

**Files:**
- Create: `src/collections/Pageviews.ts`
- Modify: `src/payload.config.ts`
- Auto-generated: `src/lib/migrations/<timestamp>_pageviews.ts`

- [ ] **Step 1: Create the collection definition**

Create `src/collections/Pageviews.ts`:

```ts
import type { CollectionConfig } from 'payload'

export const Pageviews: CollectionConfig = {
  slug: 'pageviews',
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'country', 'device', 'createdAt'],
    hidden: true,
    description: 'Self-hosted pageview log. Surfaced via the analytics view.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'path', type: 'text', required: true, index: true },
    { name: 'country', type: 'text', index: true },
    { name: 'city', type: 'text' },
    { name: 'region', type: 'text' },
    {
      name: 'device',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Bot', value: 'bot' },
      ],
    },
    { name: 'browser', type: 'text' },
    { name: 'os', type: 'text' },
    { name: 'referrer', type: 'text' },
    { name: 'ipHash', type: 'text', required: true, index: true },
    { name: 'userAgent', type: 'text' },
  ],
  timestamps: true,
}
```

- [ ] **Step 2: Register the collection in `payload.config.ts`**

In `src/payload.config.ts`:

Add the import next to the other collection imports:
```ts
import { Pageviews } from './collections/Pageviews'
```

Update the `collections` array:
```ts
collections: [Users, Media, Work, Posts, Craft, Pageviews],
```

- [ ] **Step 3: Generate Payload types**

```bash
bun run generate:types
```

Expected: `src/payload-types.ts` updates with a `Pageview` type.

- [ ] **Step 4: Generate the database migration**

```bash
bun payload migrate:create pageviews
```

Expected: a new file in `src/lib/migrations/<timestamp>_pageviews.ts` plus its `.json` snapshot. Read the generated `.ts` to confirm it creates a `pageviews` table with the expected columns + indexes.

- [ ] **Step 5: Apply the migration locally**

```bash
bun payload migrate
```

Expected: "Migration: <timestamp>_pageviews ran successfully".

- [ ] **Step 6: Type-check**

```bash
bun run type-check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/collections/Pageviews.ts src/payload.config.ts src/payload-types.ts src/lib/migrations/
git commit -m "feat(analytics): add pageviews collection + migration"
```

---

## Task 3: Helper utilities (UA parser, IP hash, range, rate limit)

**Files:**
- Create: `src/lib/analytics/ua.ts`
- Create: `src/lib/analytics/ipHash.ts`
- Create: `src/lib/analytics/range.ts`
- Create: `src/lib/analytics/rateLimit.ts`
- Create: `scripts/smoke-helpers.ts`

- [ ] **Step 1: Create `src/lib/analytics/ua.ts`**

```ts
import { UAParser } from 'ua-parser-js'

export type Device = 'desktop' | 'mobile' | 'tablet' | 'bot'

export function parseUA(userAgent: string): {
  device: Device
  browser: string
  os: string
} {
  const parsed = new UAParser(userAgent).getResult()
  const rawDevice = parsed.device.type
  const device: Device =
    rawDevice === 'mobile' ? 'mobile' : rawDevice === 'tablet' ? 'tablet' : 'desktop'
  return {
    device,
    browser: (parsed.browser.name ?? '').toLowerCase(),
    os: (parsed.os.name ?? '').toLowerCase(),
  }
}
```

- [ ] **Step 2: Create `src/lib/analytics/ipHash.ts`**

```ts
import { createHash } from 'crypto'

export function hashIp(ip: string): string {
  const salt = process.env.PAYLOAD_IP_SALT
  if (!salt || salt.length < 32) {
    throw new Error('PAYLOAD_IP_SALT must be set to a string of at least 32 characters')
  }
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex')
}
```

- [ ] **Step 3: Create `src/lib/analytics/range.ts`**

```ts
export type Range = '24h' | '7d' | '30d' | '90d'

export const RANGES: Range[] = ['24h', '7d', '30d', '90d']

export const RANGE_LABELS: Record<Range, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

export function parseRange(value: string | undefined | null): Range {
  return (RANGES as string[]).includes(value ?? '') ? (value as Range) : '7d'
}

export function rangeToSince(range: Range): Date {
  const now = Date.now()
  const ms =
    range === '24h'
      ? 24 * 60 * 60 * 1000
      : range === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : range === '30d'
          ? 30 * 24 * 60 * 60 * 1000
          : 90 * 24 * 60 * 60 * 1000
  return new Date(now - ms)
}

export function rangeBuckets(range: Range): { bucket: 'hour' | 'day'; count: number } {
  if (range === '24h') return { bucket: 'hour', count: 24 }
  if (range === '7d') return { bucket: 'day', count: 7 }
  if (range === '30d') return { bucket: 'day', count: 30 }
  return { bucket: 'day', count: 90 }
}
```

- [ ] **Step 4: Create `src/lib/analytics/rateLimit.ts`**

```ts
type Bucket = { tokens: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX = 60
const WINDOW_MS = 60_000

export function rateLimit(key: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { tokens: MAX - 1, resetAt: now + WINDOW_MS })
    return { ok: true, retryAfterSec: 0 }
  }
  if (existing.tokens > 0) {
    existing.tokens -= 1
    return { ok: true, retryAfterSec: 0 }
  }
  return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) }
}
```

Note: this is in-memory per-instance. On Vercel's multi-region serverless, each instance has its own counter — fine for a portfolio site, not a spam shield. The goal here is "stop one runaway browser tab," not abuse prevention.

- [ ] **Step 5: Create a smoke script `scripts/smoke-helpers.ts`**

```ts
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
```

- [ ] **Step 6: Run the smoke script**

```bash
bun run scripts/smoke-helpers.ts
```

Expected output ends with `OK`.

- [ ] **Step 7: Type-check + lint**

```bash
bun run type-check && bun run lint
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/analytics scripts/smoke-helpers.ts
git commit -m "feat(analytics): add UA, IP hash, range, and rate-limit helpers"
```

---

## Task 4: Tracking endpoint `/api/pv`

**Files:**
- Create: `src/app/api/pv/route.ts`
- Create: `scripts/smoke-pv.ts`

- [ ] **Step 1: Create the route handler**

Create `src/app/api/pv/route.ts`:

```ts
import { getPayload } from 'payload'
import config from '@payload-config'
import isbot from 'isbot'
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
```

- [ ] **Step 2: Create smoke script `scripts/smoke-pv.ts`**

```ts
const url = process.env.SMOKE_URL ?? 'http://localhost:3000/api/pv'

async function call(body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  return { status: res.status, text: await res.text() }
}

const human = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'x-forwarded-for': '203.0.113.10',
  'x-vercel-ip-country': 'US',
  'x-vercel-ip-city': 'San Francisco',
}

const okHuman = await call({ path: '/work', referrer: 'https://google.com' }, human)
console.log('human:', okHuman)
if (okHuman.status !== 204) throw new Error(`expected 204, got ${okHuman.status}`)

const bot = await call(
  { path: '/' },
  { 'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
)
console.log('bot:', bot)
if (bot.status !== 204) throw new Error(`bots should also return 204`)

const noPath = await call({}, human)
console.log('no path:', noPath)
if (noPath.status !== 400) throw new Error('expected 400 when path missing')

console.log('OK')
```

- [ ] **Step 3: Run dev server in another terminal**

```bash
bun dev
```

Wait for "Ready in …".

- [ ] **Step 4: Run the smoke script**

```bash
bun run scripts/smoke-pv.ts
```

Expected output ends with `OK`.

- [ ] **Step 5: Verify a row landed in the DB**

Visit `http://localhost:3000/admin/collections/pageviews` after temporarily flipping `admin.hidden` to `false` in `Pageviews.ts`, OR query directly:

```bash
bun -e "import('payload').then(({getPayload}) => import('@payload-config').then(({default:c}) => getPayload({config:c}).then(p => p.find({collection:'pageviews', limit: 5}).then(r => console.log(JSON.stringify(r.docs, null, 2))))))"
```

Expected: at least one row with `path: '/work'`, `country: 'US'`, `device: 'desktop'`. Confirm `ipHash` is a 64-char hex, **not** the raw IP.

- [ ] **Step 6: Type-check + lint**

```bash
bun run type-check && bun run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/pv scripts/smoke-pv.ts
git commit -m "feat(analytics): add /api/pv tracking endpoint with bot filter and rate limit"
```

---

## Task 5: Site instrumentation — `<Track />` + `@vercel/analytics`

**Files:**
- Create: `src/components/site/Track.tsx`
- Modify: `src/app/(frontend)/layout.tsx`

- [ ] **Step 1: Create the client tracker**

Create `src/components/site/Track.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function Track() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const referrer = typeof document !== 'undefined' ? document.referrer : ''
    fetch('/api/pv', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer }),
      keepalive: true,
    }).catch(() => {})
    // include searchParams so navigations that only change the query still fire
  }, [pathname, searchParams])

  return null
}
```

- [ ] **Step 2: Mount it in the public layout**

Modify `src/app/(frontend)/layout.tsx`:

Add imports near the top:
```ts
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Track } from '@/components/site/Track'
```

Update the body of `RootLayout` so the body contains `<Analytics />` and a Suspense-wrapped `<Track />` (Suspense is required because `useSearchParams` suspends the tree):

```tsx
<body className="px-8">
  <ThemeProvider>
    <AudioProvider>{children}</AudioProvider>
  </ThemeProvider>
  <Suspense fallback={null}>
    <Track />
  </Suspense>
  <Analytics />
</body>
```

- [ ] **Step 3: Smoke test in the browser**

With `bun dev` running, open `http://localhost:3000/`. In DevTools → Network, filter for `pv`. Expected: one `POST /api/pv` per route navigation, all returning `204`.

Then navigate to `/work` and confirm a second request fires.

- [ ] **Step 4: Confirm rows in DB**

```bash
bun -e "import('payload').then(({getPayload}) => import('@payload-config').then(({default:c}) => getPayload({config:c}).then(p => p.find({collection:'pageviews', limit: 5, sort:'-createdAt'}).then(r => console.log(JSON.stringify(r.docs, null, 2))))))"
```

Expected: rows for `/` and `/work`.

- [ ] **Step 5: Type-check + lint**

```bash
bun run type-check && bun run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/site/Track.tsx src/app/\(frontend\)/layout.tsx
git commit -m "feat(analytics): instrument public site with Track + @vercel/analytics"
```

---

## Task 6: Aggregation query helpers

**Files:**
- Create: `src/lib/analytics/aggregate.ts`
- Create: `scripts/smoke-aggregate.ts`

This task hits Postgres directly via Payload's Drizzle adapter (`payload.db.drizzle`). Payload's Local API doesn't natively support `GROUP BY` or `COUNT DISTINCT` aggregates.

- [ ] **Step 1: Create `src/lib/analytics/aggregate.ts`**

```ts
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
```

- [ ] **Step 2: Create smoke script `scripts/smoke-aggregate.ts`**

```ts
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
```

- [ ] **Step 3: Seed a few rows so the queries return data**

With dev server running (`bun dev`), in your browser hit `http://localhost:3000/`, `/work`, and `/posts` a couple of times each. Or run the previous `scripts/smoke-pv.ts` a few times.

- [ ] **Step 4: Run the smoke script**

```bash
bun run scripts/smoke-aggregate.ts
```

Expected: prints non-empty totals/arrays and ends with `OK`. If totals are zero, seed more rows and re-run.

- [ ] **Step 5: Type-check + lint**

```bash
bun run type-check && bun run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/analytics/aggregate.ts scripts/smoke-aggregate.ts
git commit -m "feat(analytics): add aggregation query helpers"
```

---

## Task 7: `RangeSelector` client component

**Files:**
- Create: `src/components/admin/AnalyticsView/RangeSelector.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { RANGES, RANGE_LABELS, type Range } from '@/lib/analytics/range'

export function RangeSelector({ value }: { value: Range }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (next: Range) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('range', next)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Range)}
      style={{
        padding: '6px 10px',
        borderRadius: 6,
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-input-bg)',
        color: 'var(--theme-text)',
        fontSize: 13,
      }}
    >
      {RANGES.map((r) => (
        <option key={r} value={r}>
          {RANGE_LABELS[r]}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 2: Type-check + lint**

```bash
bun run type-check && bun run lint
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AnalyticsView/RangeSelector.tsx
git commit -m "feat(analytics): add RangeSelector client component"
```

---

## Task 8: `BeforeDashboard` summary block

**Files:**
- Create: `src/components/admin/BeforeDashboard/index.tsx`
- Create: `src/components/admin/BeforeDashboard/ChartClient.tsx`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the chart client**

`src/components/admin/BeforeDashboard/ChartClient.tsx`:

```tsx
'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export function ChartClient({
  data,
  height = 220,
}: {
  data: { date: string; visits: number }[]
  height?: number
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-elevation-100)" />
        <XAxis dataKey="label" stroke="var(--theme-elevation-400)" fontSize={11} />
        <YAxis stroke="var(--theme-elevation-400)" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="visits"
          stroke="currentColor"
          fill="url(#visitsGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Create the RSC summary block**

`src/components/admin/BeforeDashboard/index.tsx`:

```tsx
import Link from 'next/link'
import {
  getTotals,
  getTimeseries,
  getTopCountries,
  getDeviceSplit,
  getTopPages,
} from '@/lib/analytics/aggregate'
import { parseRange, RANGE_LABELS } from '@/lib/analytics/range'
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={cardStyle}>
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
              {topCountry ? `${topCountry.country} ${topCountry.pct}%` : '—'}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
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
                <span>{c.country}</span>
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
```

- [ ] **Step 3: Register in `payload.config.ts`**

In `src/payload.config.ts`, update the `admin` block:

```ts
admin: {
  user: Users.slug,
  importMap: {
    baseDir: path.resolve(dirname),
  },
  components: {
    beforeDashboard: ['/components/admin/BeforeDashboard/index'],
  },
},
```

The path is rooted at `src/` (Payload's import map base), so the file at `src/components/admin/BeforeDashboard/index.tsx` is referenced as `/components/admin/BeforeDashboard/index`.

- [ ] **Step 4: Regenerate the Payload import map**

```bash
bun run generate:importmap
```

Expected: `src/app/(payload)/admin/importMap.js` updates to include the new component path.

- [ ] **Step 5: Manual verification**

```bash
bun dev
```

Visit `http://localhost:3000/admin`. Expected: the analytics summary section renders **above** the default collection cards. Chart shows the timeseries. Stats and three breakdown columns populate. Range selector works (changes URL `?range=...` and re-renders).

If the chart looks empty: confirm seed data exists by hitting a few public pages, then refresh `/admin`.

- [ ] **Step 6: Type-check + lint**

```bash
bun run type-check && bun run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/BeforeDashboard src/payload.config.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat(analytics): add BeforeDashboard summary block on /admin"
```

---

## Task 9: AnalyticsView shell + route registration

**Files:**
- Create: `src/components/admin/AnalyticsView/index.tsx`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the view shell**

`src/components/admin/AnalyticsView/index.tsx`:

```tsx
import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import { parseRange, RANGE_LABELS } from '@/lib/analytics/range'
import { RangeSelector } from './RangeSelector'

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
}

export default async function AnalyticsView({ initPageResult }: AdminViewServerProps) {
  const params = initPageResult?.req?.query as Record<string, string | undefined> | undefined
  const range = parseRange(params?.range)

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

      <p style={{ opacity: 0.7, fontSize: 13 }}>
        Sections will populate as you wire them up.
      </p>
    </Gutter>
  )
}
```

- [ ] **Step 2: Register the view in `payload.config.ts`**

Update the `admin` block:

```ts
admin: {
  user: Users.slug,
  importMap: {
    baseDir: path.resolve(dirname),
  },
  components: {
    beforeDashboard: ['/components/admin/BeforeDashboard/index'],
    views: {
      analytics: {
        Component: '/components/admin/AnalyticsView/index',
        path: '/analytics',
      },
    },
  },
},
```

- [ ] **Step 3: Regenerate import map**

```bash
bun run generate:importmap
```

- [ ] **Step 4: Verify**

With `bun dev` running, click the "View full analytics →" link from `/admin`. Expected: lands at `/admin/analytics`, shows the header with title + RangeSelector + "Open in Vercel" button. The page is empty below the header for now — that's expected.

- [ ] **Step 5: Type-check + lint**

```bash
bun run type-check && bun run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/AnalyticsView/index.tsx src/payload.config.ts src/app/\(payload\)/admin/importMap.js
git commit -m "feat(analytics): add AnalyticsView shell at /admin/analytics"
```

---

## Task 10: AnalyticsView — Timeseries section

**Files:**
- Create: `src/components/admin/AnalyticsView/Timeseries.tsx`
- Modify: `src/components/admin/AnalyticsView/index.tsx`

- [ ] **Step 1: Create the section**

`src/components/admin/AnalyticsView/Timeseries.tsx`:

```tsx
'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type Mode = 'visits' | 'unique'

export function Timeseries({
  data,
}: {
  data: { date: string; visits: number; unique: number }[]
}) {
  const [mode, setMode] = useState<Mode>('visits')
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }))

  return (
    <section style={{ marginBottom: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 14 }}>Visits over time</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['visits', 'unique'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 4,
                border: '1px solid var(--theme-elevation-150)',
                background: mode === m ? 'var(--theme-elevation-100)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {m === 'visits' ? 'Total' : 'Unique'}
            </button>
          ))}
        </div>
      </header>
      <div style={{ height: 320, border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-elevation-100)" />
            <XAxis dataKey="label" stroke="var(--theme-elevation-400)" fontSize={11} />
            <YAxis stroke="var(--theme-elevation-400)" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--theme-elevation-50)',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey={mode} stroke="currentColor" fill="currentColor" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into the view**

In `src/components/admin/AnalyticsView/index.tsx`:

Add import:
```ts
import { getTimeseries } from '@/lib/analytics/aggregate'
import { Timeseries } from './Timeseries'
```

Inside the component, after `const range = parseRange(...)`:
```tsx
const timeseries = await getTimeseries(range)
```

Replace the placeholder `<p>` with:
```tsx
<Timeseries data={timeseries} />
```

- [ ] **Step 3: Regenerate import map (only needed once components are referenced from the config; in this case Timeseries is imported directly so no change is required, but run anyway for safety)**

```bash
bun run generate:importmap
```

- [ ] **Step 4: Manual verification**

Visit `/admin/analytics`. Expected: timeseries chart renders. Toggle Total/Unique flips the curve.

- [ ] **Step 5: Type-check + lint**

```bash
bun run type-check && bun run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/AnalyticsView
git commit -m "feat(analytics): add Timeseries section to analytics view"
```

---

## Task 11: AnalyticsView — Geography (countries + cities)

**Files:**
- Create: `src/components/admin/AnalyticsView/GeoTables.tsx`
- Modify: `src/components/admin/AnalyticsView/index.tsx`

- [ ] **Step 1: Create the section**

`src/components/admin/AnalyticsView/GeoTables.tsx`:

```tsx
import type { CountryRow, CityRow } from '@/lib/analytics/aggregate'

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
                <td style={tdStyle}>{c.country}</td>
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
                <td style={tdStyle}>{c.country}</td>
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
```

- [ ] **Step 2: Wire it in**

In `src/components/admin/AnalyticsView/index.tsx`:

Add imports:
```ts
import { getTopCountries, getTopCities } from '@/lib/analytics/aggregate'
import { GeoTables } from './GeoTables'
```

Add fetches and render below `<Timeseries>`:
```tsx
const [countries, cities] = await Promise.all([
  getTopCountries(range, 25),
  getTopCities(range, 25),
])
```
And below the Timeseries render:
```tsx
<GeoTables countries={countries} cities={cities} />
```

- [ ] **Step 3: Verify**

`/admin/analytics` shows two side-by-side tables (Countries, Cities) populated for your seed data.

- [ ] **Step 4: Type-check + lint**

```bash
bun run type-check && bun run lint
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AnalyticsView
git commit -m "feat(analytics): add geography tables to analytics view"
```

---

## Task 12: AnalyticsView — Devices, browsers, OS

**Files:**
- Create: `src/components/admin/AnalyticsView/DeviceCharts.tsx`
- Modify: `src/components/admin/AnalyticsView/index.tsx`

- [ ] **Step 1: Create the section**

`src/components/admin/AnalyticsView/DeviceCharts.tsx`:

```tsx
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { DeviceRow, SplitRow } from '@/lib/analytics/aggregate'

const PIE_COLORS = ['#5b8def', '#9a7af1', '#f17a8e', '#f1b07a']

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
  height: 280,
}

export function DeviceCharts({
  devices,
  browsers,
  os,
}: {
  devices: DeviceRow[]
  browsers: SplitRow[]
  os: SplitRow[]
}) {
  return (
    <section
      style={{
        marginBottom: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}
    >
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Devices</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={devices} dataKey="visits" nameKey="device" outerRadius={80} label>
              {devices.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Browsers</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={browsers}>
            <XAxis dataKey="key" stroke="var(--theme-elevation-400)" fontSize={11} />
            <YAxis stroke="var(--theme-elevation-400)" fontSize={11} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="visits" fill="#5b8def" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>OS</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={os}>
            <XAxis dataKey="key" stroke="var(--theme-elevation-400)" fontSize={11} />
            <YAxis stroke="var(--theme-elevation-400)" fontSize={11} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="visits" fill="#9a7af1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Wire it in**

In `src/components/admin/AnalyticsView/index.tsx`:

Add imports:
```ts
import { getDeviceSplit, getBrowserSplit, getOsSplit } from '@/lib/analytics/aggregate'
import { DeviceCharts } from './DeviceCharts'
```

Add fetches:
```tsx
const [devices, browsers, os] = await Promise.all([
  getDeviceSplit(range),
  getBrowserSplit(range),
  getOsSplit(range),
])
```

Render below `<GeoTables>`:
```tsx
<DeviceCharts devices={devices} browsers={browsers} os={os} />
```

- [ ] **Step 3: Verify**

`/admin/analytics` shows pie + two bar charts.

- [ ] **Step 4: Type-check + lint**

```bash
bun run type-check && bun run lint
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AnalyticsView
git commit -m "feat(analytics): add device / browser / OS charts to analytics view"
```

---

## Task 13: AnalyticsView — Top pages

**Files:**
- Create: `src/components/admin/AnalyticsView/TopPages.tsx`
- Modify: `src/components/admin/AnalyticsView/index.tsx`

- [ ] **Step 1: Create the section**

```tsx
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
```

- [ ] **Step 2: Wire it in**

In `index.tsx`:
```ts
import { getTopPages } from '@/lib/analytics/aggregate'
import { TopPages } from './TopPages'
```
```tsx
const pages = await getTopPages(range, 25)
```
Render below DeviceCharts:
```tsx
<TopPages pages={pages} />
```

- [ ] **Step 3: Verify, type-check, lint, commit**

```bash
bun run type-check && bun run lint
```

```bash
git add src/components/admin/AnalyticsView
git commit -m "feat(analytics): add top pages table to analytics view"
```

---

## Task 14: AnalyticsView — Top referrers

**Files:**
- Create: `src/components/admin/AnalyticsView/TopReferrers.tsx`
- Modify: `src/components/admin/AnalyticsView/index.tsx`

- [ ] **Step 1: Create the section**

```tsx
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
```

- [ ] **Step 2: Wire it in**

```ts
import { getTopReferrers } from '@/lib/analytics/aggregate'
import { TopReferrers } from './TopReferrers'
```
```tsx
const referrers = await getTopReferrers(range, 25)
```
Render below TopPages:
```tsx
<TopReferrers referrers={referrers} />
```

- [ ] **Step 3: Verify, type-check, lint, commit**

```bash
bun run type-check && bun run lint
```

```bash
git add src/components/admin/AnalyticsView
git commit -m "feat(analytics): add top referrers table to analytics view"
```

---

## Task 15: AnalyticsView — Recent events (paginated)

**Files:**
- Create: `src/components/admin/AnalyticsView/RecentEvents.tsx`
- Modify: `src/components/admin/AnalyticsView/index.tsx`

- [ ] **Step 1: Create the section**

```tsx
import Link from 'next/link'
import type { EventRow } from '@/lib/analytics/aggregate'
import type { Range } from '@/lib/analytics/range'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
  marginBottom: 24,
}
const cellStyle: React.CSSProperties = { padding: '6px 8px', borderTop: '1px solid var(--theme-elevation-100)' }

export function RecentEvents({
  rows,
  total,
  page,
  pageSize,
  range,
}: {
  rows: EventRow[]
  total: number
  page: number
  pageSize: number
  range: Range
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section style={cardStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 13 }}>Recent events ({total.toLocaleString()})</h3>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          Page {page} of {totalPages}
        </span>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {['Time', 'Path', 'Country', 'City', 'Device', 'Browser', 'Referrer', 'IP hash'].map(
              (h) => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', opacity: 0.7 }}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={cellStyle}>{new Date(r.createdAt).toLocaleString()}</td>
              <td style={cellStyle}>{r.path}</td>
              <td style={cellStyle}>{r.country}</td>
              <td style={cellStyle}>{r.city}</td>
              <td style={cellStyle}>{r.device}</td>
              <td style={cellStyle}>{r.browser}</td>
              <td style={cellStyle}>
                {r.referrer ? (
                  <a href={r.referrer} target="_blank" rel="noopener noreferrer">
                    {new URL(r.referrer).host}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td style={{ ...cellStyle, fontFamily: 'monospace' }}>{r.ipHash.slice(0, 8)}…</td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {page > 1 && (
          <Link href={`/admin/analytics?range=${range}&page=${page - 1}`} style={{ fontSize: 12 }}>
            ← Prev
          </Link>
        )}
        {page < totalPages && (
          <Link href={`/admin/analytics?range=${range}&page=${page + 1}`} style={{ fontSize: 12 }}>
            Next →
          </Link>
        )}
      </nav>
    </section>
  )
}
```

- [ ] **Step 2: Wire it in**

In `src/components/admin/AnalyticsView/index.tsx`:

Add imports:
```ts
import { getRecentEvents } from '@/lib/analytics/aggregate'
import { RecentEvents } from './RecentEvents'
```

Inside the component, after `const range = parseRange(...)`:
```tsx
const pageSize = 50
const pageNum = Math.max(1, Number(params?.page) || 1)
const events = await getRecentEvents(range, pageNum, pageSize)
```

Render at the bottom:
```tsx
<RecentEvents
  rows={events.rows}
  total={events.total}
  page={pageNum}
  pageSize={pageSize}
  range={range}
/>
```

- [ ] **Step 3: Verify**

`/admin/analytics` shows the events table with "Prev / Next" pagination at the bottom. Click Next, the URL updates to `?page=2`, the table re-renders with older rows.

- [ ] **Step 4: Type-check + lint**

```bash
bun run type-check && bun run lint
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AnalyticsView
git commit -m "feat(analytics): add recent events table with pagination"
```

---

## Task 16: Final end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Clean restart**

```bash
bun run devsafe
```

- [ ] **Step 2: Seed traffic**

In a private browser window, visit:
- `http://localhost:3000/`
- `http://localhost:3000/work`
- `http://localhost:3000/posts`
- `http://localhost:3000/work/<any item slug if you have one>`

Refresh each a couple of times to generate rows.

- [ ] **Step 3: Verify `/admin` summary**

Open `http://localhost:3000/admin` (logged in). Confirm:
- Analytics summary block renders **above** the default Payload "Collections" cards.
- Chart shows a curve.
- Stat tiles populate (Visits / Unique / Top country / Top device).
- Three breakdown columns render with non-empty data.
- "View full analytics →" link goes to `/admin/analytics`.

- [ ] **Step 4: Verify `/admin/analytics`**

Confirm all six sections render:
1. Header with title + RangeSelector + "Open in Vercel" button.
2. Timeseries with Total/Unique toggle.
3. Geography (Countries + Cities tables).
4. Devices / Browsers / OS charts.
5. Top pages table.
6. Top referrers table.
7. Recent events table with pagination.

Change the range selector. Confirm the URL updates and the page re-renders with new numbers.

- [ ] **Step 5: Verify privacy**

In a DB query, confirm `ip_hash` is hex, no `ip` column exists, no raw IP stored anywhere:

```bash
bun -e "import('payload').then(({getPayload}) => import('@payload-config').then(({default:c}) => getPayload({config:c}).then(p => p.find({collection:'pageviews', limit: 1}).then(r => console.log(Object.keys(r.docs[0] ?? {}))))))"
```

Expected: `ipHash` present, no `ip` field.

- [ ] **Step 6: Final type-check + lint + build**

```bash
bun run type-check && bun run lint && bun run build
```

Expected: all PASS.

- [ ] **Step 7: Commit any final touch-ups**

```bash
git status
# if anything is uncommitted, commit it with a clear message
```

- [ ] **Step 8: Done**

The analytics dashboard is shipped. Next deploy: ensure `PAYLOAD_IP_SALT` is set on Vercel for Production, Preview, and Development environments.

---

## Self-review notes

- All spec sections (architecture, data model, tracking flow, aggregations, summary block, full view, files, deps, env, migrations, error handling) map to a task above.
- No placeholders / TBDs.
- Function signatures used in later tasks (`getTotals`, `getTimeseries`, `getTopCountries`, `getDeviceSplit`, `getBrowserSplit`, `getOsSplit`, `getTopPages`, `getTopReferrers`, `getTopCities`, `getRecentEvents`) all match the definitions in Task 6.
- Types (`Totals`, `TimeseriesPoint`, `CountryRow`, `CityRow`, `DeviceRow`, `SplitRow`, `PageRow`, `ReferrerRow`, `EventRow`) are defined in Task 6 and consumed unchanged in later tasks.
- Verification per task uses smoke scripts + type-check + lint + manual checks since the project has no test runner installed (consistent with the user's "TDD when practical" guidance).
- One spec deviation worth flagging at execution time: the spec lists "rate limit" as 60 req/min/IP via in-memory token bucket. On Vercel's multi-region serverless this is per-instance, not global — adequate for a portfolio site.
