import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteUrl } from '@/lib/site-url'

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

type SeoMeta = { title?: string | null; description?: string | null }

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
 * Builds page metadata (title, description, openGraph, twitter, canonical).
 *
 * Image handling: this fn intentionally does NOT set openGraph.images or
 * twitter.images. Each detail route ships its own opengraph-image.tsx
 * (Next file convention) which composites the post / work cover under
 * the title text in a center-safe layout. Setting images here would
 * override the file convention.
 *
 * SEO plugin fields (`meta.title`, `meta.description`) are honored as
 * overrides over the post's title and excerpt.
 */
export async function buildPageMetadata(input: PageMetaInput): Promise<Metadata> {
  const siteUrl = getSiteUrl()
  const profile = await loadProfile()

  const fullName = profile?.fullName ?? 'Rizwan Nur Rafey'
  const shortName = profile?.shortName ?? 'Rafey'
  const twitterHandle = (profile?.socials ?? []).find((s) => s.kind === 'twitter')?.href ?? ''
  const twitterUser = twitterHandle.match(/(?:twitter\.com|x\.com)\/([^/?#]+)/)?.[1]

  const title = input.meta?.title || `${input.title} — ${shortName}`
  const description = input.meta?.description || input.description
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: twitterUser ? `@${twitterUser}` : undefined,
      site: twitterUser ? `@${twitterUser}` : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}
