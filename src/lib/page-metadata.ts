import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteUrl } from '@/lib/site-url'
import type { Media } from '@/payload-types'

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

type SeoMeta = {
  title?: string | null
  description?: string | null
  image?: Media | string | null
}

export type PageMetaInput = {
  title: string
  description: string
  path: string
  type: 'article' | 'website'
  publishedTime?: string
  meta?: SeoMeta | null
  tags?: string[]
}

/**
 * Builds page metadata for /thoughts/{slug} and /work/{slug}.
 *
 * Image policy:
 * - The Payload SEO plugin's `meta.image` is the only image source. If it
 *   is set, it becomes the og:image and twitter:image directly — used
 *   as-is, no overlay, no compositing.
 * - If `meta.image` is not set, we ship NO image in the metadata. Embed
 *   surfaces fall back to whatever the platform does for image-less
 *   links (usually just title + description, or a transparent fallback).
 *   Per project policy we do NOT fall back to the cover image.
 *
 * Title and description policy:
 * - `meta.title`       overrides → otherwise `${title} — ${shortName}`
 * - `meta.description` overrides → otherwise the doc's excerpt / description
 */
export async function buildPageMetadata(input: PageMetaInput): Promise<Metadata> {
  const siteUrl = getSiteUrl()
  const profile = await loadProfile()

  const fullName = profile?.fullName ?? 'Rizwan Nur Rafey'
  const shortName = profile?.shortName ?? 'Rafey'
  const twitterHandle = (profile?.socials ?? []).find((s) => s.kind === 'twitter')?.href ?? ''
  const twitterUser = twitterHandle.match(/(?:twitter\.com|x\.com)\/([^/?#]+)/)?.[1]

  const title = input.meta?.title?.trim() || `${input.title} — ${shortName}`
  const description = input.meta?.description?.trim() || input.description
  const url = input.path

  const seoImage = input.meta?.image ?? null
  const seoImageUrl =
    seoImage && typeof seoImage === 'object'
      ? (seoImage as Media).url ?? null
      : typeof seoImage === 'string' && /^(https?:)?\/\//.test(seoImage)
        ? seoImage
        : null
  const seoImageDims =
    seoImage && typeof seoImage === 'object'
      ? {
          width: (seoImage as Media).width ?? undefined,
          height: (seoImage as Media).height ?? undefined,
          alt: (seoImage as Media).alt ?? undefined,
        }
      : {}

  const ogImages = seoImageUrl
    ? [
        {
          url: seoImageUrl,
          width: seoImageDims.width ?? 1200,
          height: seoImageDims.height ?? 630,
          alt: seoImageDims.alt ?? title,
        },
      ]
    : undefined

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
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: seoImageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: twitterUser ? `@${twitterUser}` : undefined,
      site: twitterUser ? `@${twitterUser}` : undefined,
      ...(seoImageUrl ? { images: [seoImageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}
