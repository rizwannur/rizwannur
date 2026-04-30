'use client'

import { useEffect, useState } from 'react'
import { CompanyLink } from './CompanyLink'
import { profile } from '@/data/profile'

function formatTime(tz: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date())
  }
}

export function Footer() {
  const [time, setTime] = useState(() => formatTime(profile.timezone))
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(profile.timezone)), 30_000)
    return () => clearInterval(id)
  }, [])
  const year = new Date().getFullYear()

  return (
    <footer className="flex items-center justify-between text-[13px] text-black/70 dark:text-white/70 pt-6">
      <p className="text-black/50 dark:text-white/50">© {year} {profile.shortName}</p>
      <CompanyLink name="Start a project" href={profile.bookCall} brand="#292929" logo="/portfolio/logos/cal.svg" />
      <p suppressHydrationWarning className="text-black/50 dark:text-white/50">
        <time>{time.toLowerCase()}</time>
        <span aria-hidden> • </span>
        {profile.timezoneAbbr}
      </p>
    </footer>
  )
}
