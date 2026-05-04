type SocialKind = 'twitter' | 'instagram' | 'github' | 'linkedin' | 'resume' | 'mail'

export const PROFILE = {
  shortName: 'Rafey',
  fullName: 'Rizwan Nur Rafey',
  role: 'Product Engineer',
  avatar: '/rafey.png',

  headline: 'I architect software that takes you from idea to production. Stable, scalable, and earning revenue.',

  intro: [
    "I'm a product engineer. The short version: I figure out what to build and then I build it. UI, backend, the deploy step nobody wants to think about, all of it.",
    "So far that's looked like indie film tooling, fintech, a couple of AI products, and a few consumer apps I actually still use. The domain changes a lot. The work itself less so. You own the build, you ship it, and you stick around long enough to deal with whatever it does in production.",
  ],

  searching: "Right now I'm taking on a few new projects a quarter. Usually embedded with a small team, sometimes owning a build start to finish. If you're early and need one person who can do the thinking and the typing, send a note.",

  availability: "I work on GMT+6, which means my mornings line up with US afternoons and evenings — comfortable hours on both ends for a real working call.",

  bookCall: 'https://cal.com/rizwannur',

  socials: [
    { label: 'Twitter', href: 'https://x.com/rafeyum', kind: 'twitter' as SocialKind },
    { label: 'Instagram', href: 'https://instagram.com/rafeyum', kind: 'instagram' as SocialKind },
    { label: 'GitHub', href: 'https://github.com/rizwannur', kind: 'github' as SocialKind },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/rizwannur', kind: 'linkedin' as SocialKind },
    { label: 'Resume', href: 'https://docs.google.com/document/d/15W39xx3tRk7Cdbk690ODD9yLBJv9xZvq/edit?usp=sharing&ouid=103439662159800937701&rtpof=true&sd=true', kind: 'resume' as SocialKind },
    { label: 'Email', href: 'mailto:rizwannur116@gmail.com', kind: 'mail' as SocialKind },
  ],

  timezone: 'Asia/Dhaka',
  timezoneAbbr: 'BDT',
}
