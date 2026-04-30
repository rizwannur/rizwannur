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

async function loadAvatar(remoteUrl: string | null): Promise<string> {
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
  const buf = await readFile(path.join(process.cwd(), 'public', 'portfolio', 'hero-pfp.png'))
  return `data:image/png;base64,${buf.toString('base64')}`
}

export default async function OpenGraphImage() {
  const profile = await loadProfile()
  const avatar = await loadAvatar(profile.avatarUrl)
  const description =
    profile.intro.length > 180 ? profile.intro.slice(0, 177).trimEnd() + '…' : profile.intro

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(135deg, #fdf6ef 0%, #f6c8a8 55%, #e89272 100%)',
          fontFamily: 'serif',
          color: '#2a1810',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <img
            src={avatar}
            width={120}
            height={120}
            style={{ borderRadius: 60, objectFit: 'cover', border: '4px solid #2a1810' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1 }}>
              {profile.fullName}
            </div>
            <div style={{ fontSize: 26, opacity: 0.75, marginTop: 4 }}>{profile.role}</div>
          </div>
        </div>

        <div
          style={{
            fontStyle: 'italic',
            fontSize: 64,
            lineHeight: 1.15,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {description || `${profile.fullName} — ${profile.role}.`}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            opacity: 0.7,
          }}
        >
          <span>rizwannur.xyz</span>
          <span style={{ fontStyle: 'italic' }}>@{profile.shortName.toLowerCase()}</span>
        </div>
      </div>
    ),
    size,
  )
}
