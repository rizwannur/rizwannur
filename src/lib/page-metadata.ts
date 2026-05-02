import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteUrl } from '@/lib/site-url'
import type { Media } from '@/payload-types'

type SeoMeta = { title?: string | null; description?: string | null; image?: Media | null | string }

type Profile = Awaited<ReturnType<Awaited<ReturnType<typeof getPayload>>['findGlobal']>>

let profileCache: { value: Profile | null; expires: number } | null = null

async function loadProfile(): Promise<Profile | null> {
  const now = Date.now()
  if (profileCache && profileCache.expires > now) return profileCache.value
  try {
    const payload = await getPayload({ config })
    const profile = await payload.findGlobal({ slug: 'profile', depth: 1 })
    profileCache = { value: profile, expires: now + 60_000 }
    return profile
  } catch {
    profileCache = { value: null, expires: now + 10_000 }
    return null
  }
}

function mediaUrl(value: SeoMeta['image'] | Media | string | null | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string') {
    // Pass through full URLs (e.g. microlink screenshot); skip bare ids.
    return /^(https?:)?\/\//.test(value) ? value : null
  }
  return value.url ?? null
}

function mediaDims(value: SeoMeta['image'] | Media | string | null | undefined): { width?: number; height?: number; alt?: string } {
  if (!value || typeof value === 'string') return {}
  return {
    width: value.width ?? undefined,
    height: value.height ?? undefined,
    alt: value.alt ?? undefined,
  }
}

export type PageMetaInput = {
  title: string
  description: string
  path: string
  type: 'article' | 'website'
  publishedTime?: string
  meta?: SeoMeta | null
  fallbackImage?: Media | string | null
  tags?: string[]
}

export async function buildPageMetadata(input: PageMetaInput): Promise<Metadata> {
  const siteUrl = getSiteUrl()
  const profile = await loadProfile()

  const fullName = profile?.fullName ?? 'Rizwan Nur Rafey'
  const shortName = profile?.shortName ?? 'Rafey'
  const role = profile?.role ?? 'Full-Stack Product Engineer'
  const twitterHandle = (profile?.socials ?? []).find((s) => s.kind === 'twitter')?.href ?? ''
  const twitterUser = twitterHandle.match(/(?:twitter\.com|x\.com)\/([^/?#]+)/)?.[1]

  const title = input.meta?.title || `${input.title} — ${shortName}`
  const description = input.meta?.description || input.description

  const metaImg = input.meta?.image ?? null
  const fallbackImg = input.fallbackImage ?? null
  const ogImageUrl =
    mediaUrl(metaImg) ??
    mediaUrl(fallbackImg) ??
    `${siteUrl}/opengraph-image`
  const dims = mediaUrl(metaImg)
    ? mediaDims(metaImg)
    : mediaUrl(fallbackImg)
      ? mediaDims(fallbackImg)
      : { width: 1200, height: 630, alt: `${fullName} — ${role}` }

  const url = input.path

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: input.type,
      siteName: fullName,
      title,
      description,
      url,
      locale: 'en_US',
      ...(input.type === 'article' && input.publishedTime
        ? { publishedTime: input.publishedTime, authors: [`${siteUrl}`], tags: input.tags }
        : {}),
      images: [
        {
          url: ogImageUrl,
          width: dims.width ?? 1200,
          height: dims.height ?? 630,
          alt: dims.alt ?? `${input.title} — ${fullName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: twitterUser ? `@${twitterUser}` : undefined,
      site: twitterUser ? `@${twitterUser}` : undefined,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}
