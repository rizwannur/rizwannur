import { CompanyLink } from '@/components/ui/CompanyLink'
import { FooterClock } from './FooterClock'
import { PROFILE } from '@/lib/profile'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="flex items-center justify-between text-[13px] text-black/70 dark:text-white/70 pt-6">
      <p className="text-black/50 dark:text-white/50">© {year} {PROFILE.shortName}</p>
      <CompanyLink name="Start a project" href={PROFILE.bookCall} brand="#292929" logo="/portfolio/logos/cal.svg" />
      <FooterClock timezone={PROFILE.timezone} timezoneAbbr={PROFILE.timezoneAbbr} />
    </footer>
  )
}
