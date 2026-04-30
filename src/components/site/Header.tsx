import { NameToggle } from './NameToggle'
import { ThemeAudioPill } from './ThemeAudioPill'

type HeaderProps = {
  avatar: string
  shortName: string
  fullName: string
  role: string
}

export function Header({ avatar, shortName, fullName, role }: HeaderProps) {
  return (
    <header className="flex items-center justify-between w-full will-change-transform">
      <NameToggle avatar={avatar} shortName={shortName} fullName={fullName} role={role} />
      <ThemeAudioPill />
    </header>
  )
}
