export type Craft = {
  slug: string
  title: string
  date: string
  description: string
  cover?: string
  credit?: { name: string; href?: string }
}

export const craft: Craft[] = [
  {
    slug: 'theme-pill',
    title: 'Theme Pill',
    date: 'Apr 2026',
    description: 'A two-button pill that toggles audio and switches between light and dark with a circular wipe.',
  },
  {
    slug: 'name-toggle',
    title: 'Name Toggle',
    date: 'Apr 2026',
    description: 'Click the avatar to fold a middle name in and out with a layout-aware spring.',
  },
  {
    slug: 'soft-card',
    title: 'Soft Card',
    date: 'Mar 2026',
    description: 'A card whose cover image fades into a soft, blurred floor on hover.',
  },
  {
    slug: 'tap-sfx',
    title: 'Tap SFX',
    date: 'Mar 2026',
    description: 'A subtle audio tap on click—loud enough to feel, quiet enough to ignore.',
  },
  {
    slug: 'view-transition-wipe',
    title: 'View Transition Wipe',
    date: 'Feb 2026',
    description: 'A circular reveal between themes powered entirely by the View Transitions API.',
  },
  {
    slug: 'serif-italic-display',
    title: 'Serif Italic Display',
    date: 'Feb 2026',
    description: 'A display treatment built around a single italic serif and a lot of restraint.',
  },
]
