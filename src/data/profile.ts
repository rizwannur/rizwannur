export type Company = {
  name: string
  href: string
  /** Brand accent color, applied to the link text on hover */
  brand?: string
  /** Optional path to a square logo (≥28x28). Falls back to a colored initial. */
  logo?: string
}

export const profile = {
  firstName: 'Rizwan',
  middleName: 'Nur',
  lastName: 'Rafey',
  fullName: 'Rizwan Nur Rafey',
  shortName: 'Rafey',
  role: 'Systems Architect | Multi-Platform Systems',
  headline:
    'I architect software that takes you from idea to production — stable, scalable, and earning revenue.',
  location: 'Dhaka, Bangladesh',
  timezone: 'Asia/Dhaka',
  timezoneAbbr: 'BDT',
  availability:
    'Based in Dhaka, Bangladesh (GMT+6). I work well with US clients: 9 AM in New York is 7 PM for me, so morning calls in the US are easy to schedule.',
  email: 'rizwannur116@gmail.com',
  phone: '+880 1534 593 563',
  website: 'https://rizwannur.com',
  avatar: '/rafey.png',
  intro: [
    "I'm Rizwan Nur Rafey, a systems architect from Dhaka, Bangladesh. I design systems, ship critical infrastructure, and own delivery across frontend, backend, APIs, and infra.",
    "Most teams don't need another pair of hands — they need someone who can see the whole system, make the hard technical calls, and keep the build moving. That's the work I take on.",
  ],
  recent: {
    lead: 'Most recently I shipped',
    company: { name: 'StoryXen', href: 'https://storyxen.com', brand: '#5B3FFF' } as Company,
    tail: ' — production planning software for independent film, with a fast marketing site and dashboard built to launch.',
  },
  past: {
    lead: 'Past work includes',
    companies: [
      { name: 'Auraa', href: '#', brand: '#9333EA' },
      { name: 'PsycheConnect', href: '#', brand: '#10B981' },
      { name: 'RoofAI', href: '#', brand: '#F97316' },
      { name: 'Trusted Financing', href: '#', brand: '#1E40AF' },
    ] as Company[],
    tail: '.',
  },
  searching:
    "If you have a vague, evolving idea and need someone to turn it into a production-ready system, I take on a small number of freelance and embedded engagements each quarter. Let's talk.",
  socials: [
    { label: 'Twitter', href: 'https://x.com/rafeyum', kind: 'twitter' as const },
    { label: 'Instagram', href: 'https://instagram.com/rafeyum', kind: 'instagram' as const },
    { label: 'GitHub', href: 'https://github.com/rizwannur', kind: 'github' as const },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/rizwannur', kind: 'linkedin' as const },
    {
      label: 'Resume',
      href: 'https://docs.google.com/document/d/15W39xx3tRk7Cdbk690ODD9yLBJv9xZvq/edit?usp=sharing&ouid=103439662159800937701&rtpof=true&sd=true',
      kind: 'resume' as const,
    },
    { label: 'Mail', href: 'mailto:rizwannur116@gmail.com', kind: 'mail' as const },
  ],
  bookCall: 'https://cal.com/rizwannur',
}
