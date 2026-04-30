import React from 'react'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Track } from '@/components/site/Track'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { ThemeProvider } from './ThemeProvider'
import { AudioProvider } from '@/components/providers/AudioProvider'
import { getPayload } from 'payload'
import config from '@payload-config'
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

export async function generateMetadata() {
  try {
    const payload = await getPayload({ config })
    const profile = await payload.findGlobal({ slug: 'profile', depth: 0 })
    const firstIntro = (profile.intro ?? [])[0]?.text ?? ''
    return {
      title: `${profile.shortName} — ${profile.role}`,
      description: firstIntro,
    }
  } catch {
    return {
      title: 'Rafey',
      description: '',
    }
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

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
      </body>
    </html>
  )
}
