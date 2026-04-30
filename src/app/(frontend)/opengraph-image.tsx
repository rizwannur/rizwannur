import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'
export const alt = 'Rafey — Full-Stack Product Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadProfile() {
  try {
    const payload = await getPayload({ config })
    const p = await payload.findGlobal({ slug: 'profile', depth: 1 })
    return {
      fullName: p.fullName ?? 'Rizwan Nur Rafey',
      shortName: p.shortName ?? 'Rafey',
      role: p.role ?? 'Full-Stack Product Engineer',
      intro: (p.intro ?? [])[0]?.text ?? '',
      avatarUrl:
        typeof p.avatar === 'object' && p.avatar && 'url' in p.avatar
          ? (p.avatar as { url?: string | null }).url ?? null
          : null,
    }
  } catch {
    return {
      fullName: 'Rizwan Nur Rafey',
      shortName: 'Rafey',
      role: 'Full-Stack Product Engineer',
      intro: 'Full-Stack Product Engineer. Designing and shipping web products.',
      avatarUrl: null as string | null,
    }
  }
}

async function loadLocalCandidate(): Promise<{ data: string; mime: string } | null> {
  const candidates = [
    ['rafey.png', 'image/png'],
    ['rafey.jpg', 'image/jpeg'],
    ['og-pfp.png', 'image/png'],
    ['og-pfp.jpg', 'image/jpeg'],
    ['portfolio/hero-pfp.png', 'image/png'],
  ] as const
  for (const [rel, mime] of candidates) {
    try {
      const buf = await readFile(path.join(process.cwd(), 'public', rel))
      return { data: `data:${mime};base64,${buf.toString('base64')}`, mime }
    } catch {}
  }
  return null
}

async function loadHeroImage(remoteUrl: string | null): Promise<string> {
  if (remoteUrl && /^https?:\/\//.test(remoteUrl)) {
    try {
      const res = await fetch(remoteUrl)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        const mime = res.headers.get('content-type') ?? 'image/png'
        return `data:${mime};base64,${buf.toString('base64')}`
      }
    } catch {}
  }
  const local = await loadLocalCandidate()
  if (local) return local.data
  return ''
}

export default async function OpenGraphImage() {
  const profile = await loadProfile()
  const photo = await loadHeroImage(profile.avatarUrl)

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
              objectPosition: 'center 25%',
            }}
          />
        )}

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(11,10,20,0.92) 0%, rgba(11,10,20,0.65) 38%, rgba(11,10,20,0.05) 65%, rgba(11,10,20,0) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px 80px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', fontSize: 24, opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase' }}>
            rizwannur.com
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 720 }}>
            <div
              style={{
                display: 'flex',
                fontStyle: 'italic',
                fontSize: 96,
                lineHeight: 1,
                letterSpacing: -3,
                fontWeight: 400,
              }}
            >
              {profile.fullName}
            </div>
            <div style={{ display: 'flex', fontSize: 36, opacity: 0.92, fontWeight: 500 }}>
              {profile.role}
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 22, opacity: 0.7, fontStyle: 'italic' }}>
            @{profile.shortName.toLowerCase()}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
