import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { SITE_META } from '@/lib/site-meta'

export const runtime = 'nodejs'
export const alt = `${SITE_META.fullName} — ${SITE_META.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Root Open Graph image (1200x630).
 *
 * Just the photo, no text overlay. Title and description come from the
 * page metadata. Keeping the image clean lets the embed UI on each
 * platform (which renders title + description below the image anyway)
 * own the typography instead of fighting it.
 */
export default async function OpenGraphImage() {
  const photo = await loadPhoto()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0b0a14',
          overflow: 'hidden',
        }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={1200}
            height={630}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
            }}
          />
        )}
      </div>
    ),
    size,
  )
}

async function loadPhoto(): Promise<string> {
  const candidates = [
    ['rafey.png', 'image/png'],
    ['og-pfp.png', 'image/png'],
  ] as const
  for (const [rel, mime] of candidates) {
    try {
      const buf = await readFile(path.join(process.cwd(), 'public', rel))
      return `data:${mime};base64,${buf.toString('base64')}`
    } catch {}
  }
  return ''
}
