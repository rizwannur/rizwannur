# Payload Analytics Dashboard — Design

**Date:** 2026-04-30
**Owner:** Rafey
**Status:** Approved (ready for implementation plan)

## Goal

When the site owner visits `http://localhost:3000/admin`, render an analytics summary block (chart + stat tiles + small breakdown tables) above the default Payload dashboard cards. Provide a deeper view at `/admin/analytics` with country/city/device/browser/OS/page/referrer/raw-event breakdowns. Keep `@vercel/analytics` running so Vercel's own dashboard remains a backup view.

## Non-goals (YAGNI)

- Real-time / live updating (no SSE, no polling).
- A/B testing, funnels, or custom events beyond pageviews.
- Public-user-level analytics (the site has no public auth).
- CSV export, retention job — deferred until table size demands them.
- Reading data from Vercel Analytics (no API exists; we run our own logger in parallel).

## Why not Vercel Analytics alone

Vercel Web Analytics has no public read API and blocks iframe embeds. CSV export caps at 250 rows. To render any chart inside Payload's admin, we must collect our own data. We still install `@vercel/analytics` so Vercel's dashboard works as a secondary view, but the in-Payload chart reads from our own Postgres.

References:
- Vercel community feature request: https://community.vercel.com/t/feature-request-rest-api-endpoint-for-web-analytics-data/28422
- vercel/analytics issue #68: https://github.com/vercel/analytics/issues/68
- Payload `beforeDashboard`: https://payloadcms.com/docs/custom-components/root-components

## Architecture

```
public site <Track />  ──POST /api/pv──▶  route handler
                                               │
                                               │ payload.create()
                                               ▼
                                    Postgres: pageviews
                                               │
                              aggregate queries via Local API
                                               │
                                               ▼
                          /admin beforeDashboard summary block
                          /admin/analytics deep view
```

`<Analytics />` from `@vercel/analytics` runs alongside `<Track />`. They do not interfere.

## Data model — `pageviews` collection

| Field | Type | Index | Notes |
|---|---|---|---|
| `path` | text | yes | query string stripped, trailing slash removed, lowercased |
| `country` | text | yes | from `x-vercel-ip-country`, `"unknown"` locally |
| `city` | text | no | from `x-vercel-ip-city` |
| `region` | text | no | from `x-vercel-ip-country-region` |
| `device` | select (`desktop`/`mobile`/`tablet`/`bot`) | yes | parsed from UA via `ua-parser-js` |
| `browser` | text | no | e.g. `chrome`, `safari` |
| `os` | text | no | e.g. `macos`, `ios`, `windows` |
| `referrer` | text | no | from `Referer` header, sanitized |
| `ipHash` | text | yes | `sha256(ip + PAYLOAD_IP_SALT)`, hex (64 chars) |
| `userAgent` | text | no | raw UA string |
| `createdAt` | timestamp | yes | Payload automatic |

**Access control:**
- `read`: admin (logged-in user) only
- `create`: `() => true` (the public tracking endpoint writes here; nothing else)
- `update`/`delete`: admin only

**Admin config:** `admin.hidden = true` by default — surfaced through the analytics view rather than the sidebar nav. Toggleable later if a raw row table is desired.

**Raw IP is never stored.** Only the hash. Salt comes from `PAYLOAD_IP_SALT` env var, which must be a long random string set on every deployment. Rotating the salt invalidates unique-visitor dedup, which is acceptable.

## Tracking flow

1. `<Track />` (client component) mounts in `src/app/(frontend)/layout.tsx`. On every route change it `POST`s `{ path, referrer }` to `/api/pv`. (Same pattern as `@vercel/analytics`, but our own endpoint.)
2. `/api/pv` route handler (Node runtime):
   1. Reads request headers: `x-vercel-ip-country`, `x-vercel-ip-city`, `x-vercel-ip-country-region`, `x-forwarded-for` (or `request.ip`), `user-agent`.
   2. Bot check: if `isbot(userAgent)` → return `204` and exit.
   3. Rate limit: in-memory token bucket keyed by IP, max 60 req/min/IP. Over budget → return `429`.
   4. Compute `ipHash = sha256(ip + process.env.PAYLOAD_IP_SALT)`.
   5. Parse UA → `{ device, browser, os }`. Coerce device to one of `desktop`/`mobile`/`tablet`; anything else → `desktop`.
   6. Normalize `path`: strip query string, strip trailing slash (except root), lowercase.
   7. Sanitize `referrer`: drop if same-origin; cap to 512 chars.
   8. `payload.create({ collection: 'pageviews', data })` via the Local API.
   9. Return `204`.

**Local dev:** `x-vercel-ip-*` headers are absent. We fall back to `country = "unknown"`, `city = ""`, `region = ""`. Tracking still works locally — you can see your own visits in the dashboard.

## Aggregation queries (Local API + Drizzle)

All queries live in `src/lib/analytics/aggregate.ts`. They take a `range` ('24h' | '7d' | '30d' | '90d') and return typed shapes consumed by RSC components. Implemented via Payload's Drizzle adapter (`payload.db.drizzle`) for SQL aggregates that the Payload Local API doesn't natively support (`GROUP BY`, `COUNT DISTINCT`, `date_trunc`).

Functions:

- `getTimeseries(range)` → `{ date: string; visits: number; unique: number }[]`
- `getTotals(range)` → `{ visits: number; unique: number }`
- `getTopCountries(range, limit = 5)` → `{ country: string; visits: number; pct: number }[]`
- `getDeviceSplit(range)` → `{ device: string; visits: number; pct: number }[]`
- `getTopPages(range, limit = 10)` → `{ path: string; visits: number; unique: number }[]`
- `getTopReferrers(range, limit = 10)` → `{ referrer: string; visits: number; pct: number }[]`
- `getBrowserSplit(range)` / `getOsSplit(range)` — same shape as device split.
- `getRecentEvents(range, page, pageSize)` → paginated raw rows.
- `getTopCities(range, limit = 10)` → `{ city: string; country: string; visits: number }[]`.

**Unique definition:** `COUNT(DISTINCT ipHash, date_trunc('day', createdAt))` over the window. **Visits** = raw row count.

## Admin UI

### Summary block on `/admin` (via `admin.components.beforeDashboard`)

Single RSC that fetches `getTotals`, `getTimeseries`, `getTopCountries(3)`, `getDeviceSplit`, `getTopPages(3)` for the selected range. Layout:

- **Header row:** title "Analytics — last N" + `RangeSelector` (URL param `?range=...`).
- **Main row (left, 8 cols):** Recharts area chart of daily visits.
- **Main row (right, 4 cols):** four stat tiles — Total visits, Unique, Top country (flag + code + %), Top device.
- **Bottom row (3 mini-tables, 4 cols each):** top 3 countries, device split, top 3 pages.
- **Footer:** "View full analytics →" link to `/admin/analytics?range=<current>`.

Server-rendered totals + tables; client component only for the Recharts canvas (`ChartClient.tsx`) so the chart can hydrate without paying RSC's serialization tax for every tooltip.

### Full view at `/admin/analytics`

Registered via `admin.components.views.analytics = { Component, path: '/analytics' }`. Sections, top to bottom:

1. **Header** — title, `RangeSelector`, "Open in Vercel" deep-link button (tertiary, opens `https://vercel.com/<team>/<project>/analytics` in a new tab).
2. **Timeseries** — bigger Recharts line/area, with toggle `Total visits ⇄ Unique visitors`.
3. **Geography** — country table (country, visits, %, unique) and city table.
4. **Devices & browsers** — device pie + browser bar + OS bar, three columns.
5. **Top pages** — table: path, visits, unique, last seen.
6. **Top referrers** — table: referrer, visits, %.
7. **Recent events** — paginated raw table (50/page): time, path, country, city, device, browser, referrer, `ipHash` truncated to 8 chars.

All sections share `RangeSelector` (URL param). Server actions re-fetch on range change — no client-side store.

## Files

```
src/
├── collections/
│   └── Pageviews.ts                          NEW — collection definition + access
├── components/admin/
│   ├── BeforeDashboard/
│   │   ├── index.tsx                         NEW — RSC, runs aggregates
│   │   └── ChartClient.tsx                   NEW — Recharts area chart
│   └── AnalyticsView/
│       ├── index.tsx                         NEW — RSC, full view shell
│       ├── Timeseries.tsx                    NEW — client (toggle + chart)
│       ├── GeoTables.tsx                     NEW — RSC
│       ├── DeviceCharts.tsx                  NEW — client (pie + bars)
│       ├── TopPages.tsx                      NEW — RSC
│       ├── TopReferrers.tsx                  NEW — RSC
│       ├── RecentEvents.tsx                  NEW — RSC + pagination via URL params
│       └── RangeSelector.tsx                 NEW — client (writes URL param)
├── components/site/
│   └── Track.tsx                             NEW — client, fires POST /api/pv on route change
├── app/
│   ├── api/pv/route.ts                       NEW — POST handler (Node runtime)
│   └── (frontend)/layout.tsx                 EDIT — add <Analytics /> and <Track />
├── lib/analytics/
│   ├── aggregate.ts                          NEW — query helpers
│   ├── ua.ts                                 NEW — UA → device/browser/os
│   ├── ipHash.ts                             NEW — sha256(ip + salt)
│   ├── range.ts                              NEW — range string → SQL window
│   └── rateLimit.ts                          NEW — in-memory token bucket
├── payload.config.ts                         EDIT — register collection + admin components
└── payload-types.ts                          REGEN via `bun payload generate:types`
.env.example                                  EDIT — document PAYLOAD_IP_SALT
package.json                                  EDIT — add deps
```

## Dependencies (new)

- `@vercel/analytics` — Vercel's tracker (so Vercel dashboard keeps working).
- `recharts` — charting.
- `isbot` — bot filter.
- `ua-parser-js` — UA parsing.

No removals.

## Environment

- `PAYLOAD_IP_SALT` — long random string (≥32 chars). Required by the tracking endpoint. Documented in `.env.example`. Must be set on Vercel (Production, Preview, Development).

## Migrations

One Payload migration auto-generated when the `Pageviews` collection is added. Generated via the existing `db-postgres` adapter, written to `src/lib/migrations/`.

## Error handling at boundaries

- Tracking endpoint: any exception → log + return `204` (never let analytics break a page render).
- Aggregate queries: any exception in an admin RSC → render the section with an inline "Couldn't load this panel" message; other panels render normally.
- Missing `PAYLOAD_IP_SALT`: tracking endpoint returns `503`; admin UI still renders (just no new rows).

## Testing strategy

- **Tracking endpoint:** integration test posts a request with mocked headers, asserts a row exists and that fields are correctly normalized. Run against a real test DB (per CLAUDE.md: no mocking internal modules).
- **UA parser:** unit tests with fixture UAs for desktop/mobile/tablet/bot.
- **Aggregations:** seed a small fixture set, assert each `getX` returns expected shape and sums.
- **Admin UI:** manual verification — visit `/admin` and `/admin/analytics` after seeding, confirm chart renders and tables populate. Type-check + lint must pass.

Verification commands before claiming done: `bun run type-check`, `bun run lint`, `bun run dev` and visit `/admin` + `/admin/analytics`.

## Open questions

None. Decisions captured in the four clarifying questions above:

1. Provider: own logger writing to Payload Postgres + `@vercel/analytics` running in parallel.
2. Layout: compact summary on `/admin` + dedicated `/admin/analytics` view.
3. Privacy: hashed IP + derived country/city; no raw IP stored.
4. Chart library: Recharts.
