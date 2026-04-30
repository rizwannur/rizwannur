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

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl()
  const fallback: Metadata = {
    metadataBase: new URL(siteUrl),
    title: 'Rafey — Full-Stack Product Engineer',
    description: 'Full-Stack Product Engineer. Designing and shipping web products.',
  }

  try {
    const payload = await getPayload({ config })
    const profile = await payload.findGlobal({ slug: 'profile', depth: 0 })
    const firstIntro = (profile.intro ?? [])[0]?.text ?? ''
    const title = `${profile.shortName} — ${profile.role}`
    const description = firstIntro || fallback.description!
    const fullName = profile.fullName ?? profile.shortName ?? 'Rafey'
    const twitterHandle = (profile.socials ?? []).find((s) => s.kind === 'twitter')?.href ?? ''
    const twitterUser = twitterHandle.match(/(?:twitter\.com|x\.com)\/([^/?#]+)/)?.[1]

    return {
      metadataBase: new URL(siteUrl),
      title: { default: title, template: `%s — ${profile.shortName}` },
      description,
      applicationName: fullName,
      authors: [{ name: fullName, url: siteUrl }],
      creator: fullName,
      publisher: fullName,
      keywords: [
        fullName,
        profile.shortName,
        profile.role,
        'Full-Stack Engineer',
        'Product Engineer',
        'Web Developer',
        'Portfolio',
      ].filter(Boolean) as string[],
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
  } catch {
    return fallback
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const siteUrl = getSiteUrl()

  let fullName = 'Rizwan Nur Rafey'
  let role = 'Full-Stack Product Engineer'
  let description = 'Full-Stack Product Engineer. Designing and shipping web products.'
  let avatarUrl: string | null = null
  const socialUrls: string[] = []

  try {
    const payload = await getPayload({ config })
    const profile = await payload.findGlobal({ slug: 'profile', depth: 1 })
    fullName = profile.fullName ?? fullName
    role = profile.role ?? role
    description = (profile.intro ?? [])[0]?.text ?? description
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
    name: fullName,
    url: siteUrl,
    image: avatarUrl ?? `${siteUrl}/portfolio/hero-pfp.png`,
    jobTitle: role,
    description,
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
