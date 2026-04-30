'use client'

import { useEffect, useState } from 'react'

function formatTime(tz: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz,
    }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date())
  }
}

export function FooterClock({ timezone, timezoneAbbr }: { timezone: string; timezoneAbbr: string }) {
  const [time, setTime] = useState(() => formatTime(timezone))
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(timezone)), 30_000)
    return () => clearInterval(id)
  }, [timezone])

  return (
    <p suppressHydrationWarning className="text-black/50 dark:text-white/50">
      <time>{time.toLowerCase()}</time>
      <span aria-hidden> • </span>
      {timezoneAbbr}
    </p>
  )
}
