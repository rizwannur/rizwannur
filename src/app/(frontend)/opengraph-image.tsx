import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { SITE_META } from '@/lib/site-meta'

export const runtime = 'nodejs'
export const alt = `${SITE_META.fullName} — ${SITE_META.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadLocalPhoto(): Promise<string> {
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
 * Open Graph image (1200x630).
 *
 * Designed so the most important content — the name and role — sits in the
 * center 630x630 "safe zone" of the canvas. Square / 4:5 crops used by
 * Instagram, Discord, etc. still show the headline. The photo lives on the
 * left as supporting context, behind a soft vertical gradient so it works
 * even on platforms that crop the image hard.
 */
export default async function OpenGraphImage() {
  const photo = await loadLocalPhoto()
  const { fullName, role, shortName } = SITE_META

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#0b0a14',
          color: '#fff',
          fontFamily: 'serif',
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
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 35%',
              opacity: 0.55,
            }}
          />
        )}

        {/* Center-weighted darkening so the headline reads regardless of crop. */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(11,10,20,0.85) 0%, rgba(11,10,20,0.65) 45%, rgba(11,10,20,0.35) 75%, rgba(11,10,20,0.2) 100%)',
          }}
        />

        {/* Top-left domain badge — survives most crops. */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 64,
            display: 'flex',
            fontSize: 22,
            opacity: 0.85,
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          rizwannur.com
        </div>

        {/* Centered headline — name + role. Sits inside the 630x630 safe area. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            padding: '0 80px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontStyle: 'italic',
              fontSize: 110,
              lineHeight: 1,
              letterSpacing: -4,
              fontWeight: 400,
              textShadow: '0 2px 32px rgba(0,0,0,0.6)',
            }}
          >
            {fullName}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              opacity: 0.95,
              fontWeight: 500,
              fontFamily: 'sans-serif',
              textShadow: '0 2px 16px rgba(0,0,0,0.7)',
            }}
          >
            {role}
          </div>
        </div>

        {/* Bottom-right handle. */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            right: 64,
            display: 'flex',
            fontSize: 22,
            opacity: 0.6,
            fontStyle: 'italic',
          }}
        >
          @{shortName.toLowerCase()}
        </div>
      </div>
    ),
    size,
  )
}
