import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Loads the first available local hero photo as a base64 data URL. Used as
 * a default background when a post / work item has no cover image set.
 */
export async function loadLocalPhoto(): Promise<string> {
  const candidates = [
    ['rafey.png', 'image/png'],
    ['og-pfp.png', 'image/png'],
    ['portfolio/hero-pfp.png', 'image/png'],
  ] as const
  for (const [rel, mime] of candidates) {
    try {
      const buf = await readFile(path.join(process.cwd(), 'public', rel))
      return `data:${mime};base64,${buf.toString('base64')}`
    } catch {}
  }
  return ''
}

/**
 * Fetches a remote image (e.g. Vercel Blob URL from Payload media) and
 * returns it as a base64 data URL. Returns '' on any error so callers can
 * fall back to a default photo without crashing the OG render.
 */
export async function fetchAsDataUrl(remoteUrl: string | null | undefined): Promise<string> {
  if (!remoteUrl) return ''
  if (!/^https?:\/\//.test(remoteUrl)) return ''
  try {
    const res = await fetch(remoteUrl, { cache: 'no-store' })
    if (!res.ok) return ''
    const buf = Buffer.from(await res.arrayBuffer())
    const mime = res.headers.get('content-type') ?? 'image/png'
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return ''
  }
}
