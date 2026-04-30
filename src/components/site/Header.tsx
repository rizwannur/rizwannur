import { NameToggle } from './NameToggle'
import { ThemeAudioPill } from './ThemeAudioPill'

export function Header() {
  return (
    <header className="flex items-center justify-between w-full will-change-transform">
      <NameToggle />
      <ThemeAudioPill />
    </header>
  )
}
