import { getPayload } from 'payload'
import config from '@payload-config'
import { CompanyLink } from './CompanyLink'
import { FooterClock } from './FooterClock'

export async function Footer() {
  const payload = await getPayload({ config })
  const profile = await payload.findGlobal({ slug: 'profile', depth: 0 })

  const year = new Date().getFullYear()
  const shortName = profile.shortName ?? 'Rafey'
  const bookCall = profile.bookCall ?? '#'
  const timezone = profile.timezone ?? 'Asia/Dhaka'
  const timezoneAbbr = profile.timezoneAbbr ?? 'BDT'

  return (
    <footer className="flex items-center justify-between text-[13px] text-black/70 dark:text-white/70 pt-6">
      <p className="text-black/50 dark:text-white/50">© {year} {shortName}</p>
      <CompanyLink name="Start a project" href={bookCall} brand="#292929" logo="/portfolio/logos/cal.svg" />
      <FooterClock timezone={timezone} timezoneAbbr={timezoneAbbr} />
    </footer>
  )
}
