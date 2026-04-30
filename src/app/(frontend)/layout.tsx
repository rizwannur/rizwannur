import React from 'react'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { ThemeProvider } from './ThemeProvider'
import { AudioProvider } from '@/components/site/AudioProvider'
import { profile } from '@/data/profile'
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

export const metadata = {
  title: `${profile.shortName} — ${profile.role}`,
  description: profile.intro[0],
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`} suppressHydrationWarning>
      <body className="px-8">
        <ThemeProvider>
          <AudioProvider>{children}</AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
