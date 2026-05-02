import React from 'react'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Track } from '@/components/site/Track'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { ThemeProvider } from './ThemeProvider'
import { AudioProvider } from '@/components/providers/AudioProvider'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteUrl, KNOWN_DOMAINS } from '@/lib/site-url'
import { SITE_META, rootTitle } from '@/lib/site-meta'
import './styles.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

// Root metadata is intentionally code-defined (see src/lib/site-meta.ts).
// Per-page metadata for /thoughts/[slug] and /work/[slug] uses the Payload
// SEO plugin via buildPageMetadata. The root template applies "%s — Rafey"
// to inherited child titles.
export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl()
  const title = rootTitle()
  const { fullName, shortName, role, description, twitterHandle, keywords } = SITE_META
  const twitterUser = twitterHandle

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${shortName}` },
    description,
    applicationName: fullName,
    authors: [{ name: fullName, url: siteUrl }],
    creator: fullName,
    publisher: fullName,
    keywords: [...keywords],
    alternates: { canonical: '/' },
    openGraph: {
      type: 'profile',
      siteName: fullName,
      title,
      description,
      url: siteUrl,
      locale: 'en_US',
      firstName: fullName.split(' ')[0],
      lastName: fullName.split(' ').slice(1).join(' ') || undefined,
      username: twitterUser,
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          secureUrl: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${fullName} — ${role}`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: twitterUser ? `@${twitterUser}` : undefined,
      site: twitterUser ? `@${twitterUser}` : undefined,
      images: [`${siteUrl}/twitter-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const siteUrl = getSiteUrl()

  // Person JSON-LD pulls socials from Profile (since they evolve), but
  // identity fields stay code-defined to match the root SEO above.
  const socialUrls: string[] = []
  let avatarUrl: string | null = null
  try {
    const payload = await getPayload({ config })
    const profile = await payload.findGlobal({ slug: 'profile', depth: 1 })
    if (typeof profile.avatar === 'object' && profile.avatar && 'url' in profile.avatar) {
      avatarUrl = (profile.avatar as { url?: string | null }).url ?? null
    }
    for (const s of profile.socials ?? []) if (s.href) socialUrls.push(s.href)
  } catch {}

  const sameAs = Array.from(
    new Set([...KNOWN_DOMAINS.filter((d) => d !== siteUrl), ...socialUrls]),
  )

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_META.fullName,
    url: siteUrl,
    image: avatarUrl ?? `${siteUrl}/rafey.png`,
    jobTitle: SITE_META.role,
    description: SITE_META.description,
    sameAs,
  }

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`} suppressHydrationWarning>
      <body className="px-8">
        <ThemeProvider>
          <AudioProvider>{children}</AudioProvider>
        </ThemeProvider>
        <Suspense fallback={null}>
          <Track />
        </Suspense>
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </body>
    </html>
  )
}
