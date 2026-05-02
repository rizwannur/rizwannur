import { ImageResponse } from 'next/og'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SITE_META } from '@/lib/site-meta'
import { fetchAsDataUrl, loadLocalPhoto } from '@/lib/og-helpers'
import { microlinkScreenshot } from '@/lib/microlink'
import type { Media, Work } from '@/payload-types'

export const runtime = 'nodejs'
export const alt = 'Project on rizwannur.com'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Per-work Open Graph image (1200x630).
 *
 * Background priority: meta.image → cover upload → microlink screenshot of
 * href → local hero photo. Title overlay: meta.title → "{title} — {subtitle}".
 * Same center-safe layout as the post OG so square crops survive.
 */
export default async function WorkOpenGraphImage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const fallback = await renderFallback(slug)

  let item: Work | null = null
  try {
    item = await loadWork(slug)
  } catch {
    return fallback
  }
  if (!item) return fallback

  const meta = item.meta as { title?: string; description?: string; image?: Media | string } | undefined
  const metaImageUrl = meta?.image && typeof meta.image === 'object' ? meta.image.url ?? null : null
  const coverUrl = item.cover && typeof item.cover === 'object' ? (item.cover as Media).url ?? null : null
  const screenshotUrl = !coverUrl && item.href ? microlinkScreenshot(item.href) : null

  const backgroundUrl = metaImageUrl ?? coverUrl ?? screenshotUrl
  const background =
    (await fetchAsDataUrl(backgroundUrl ?? null)) || (await loadLocalPhoto())

  const title = meta?.title?.trim() || `${item.title} — ${item.subtitle}`

  return new ImageResponse(
    composite({
      background,
      title,
      kicker: `${item.subtitle} · ${item.date}`,
    }),
    size,
  )
}

async function loadWork(slug: string): Promise<Work | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'work',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

async function renderFallback(slug: string) {
  const photo = await loadLocalPhoto()
  return new ImageResponse(
    composite({
      background: photo,
      title: SITE_META.fullName,
      kicker: `rizwannur.com/work/${slug}`,
    }),
    size,
  )
}

function composite(args: { background: string; title: string; kicker: string }) {
  const { background, title, kicker } = args
  return (
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
      {background && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={background}
          alt=""
          width={1200}
          height={630}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            opacity: 0.5,
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(11,10,20,0.9) 0%, rgba(11,10,20,0.7) 45%, rgba(11,10,20,0.45) 75%, rgba(11,10,20,0.3) 100%)',
        }}
      />

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
        rizwannur.com / work
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '0 96px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontStyle: 'italic',
            fontSize: title.length > 50 ? 64 : 84,
            lineHeight: 1.05,
            letterSpacing: -2,
            fontWeight: 400,
            textShadow: '0 2px 32px rgba(0,0,0,0.6)',
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: 64,
          right: 64,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 22,
          opacity: 0.7,
          fontFamily: 'sans-serif',
        }}
      >
        <span>{kicker}</span>
        <span style={{ fontStyle: 'italic' }}>— {SITE_META.shortName}</span>
      </div>
    </div>
  )
}
