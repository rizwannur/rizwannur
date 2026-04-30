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
