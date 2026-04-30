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
  headline: 'I architect websites, workflows, and software systems that help businesses move faster, look sharper, and convert more clients.',
  location: 'Dhaka, Bangladesh',
  timezone: 'Asia/Dhaka',
  timezoneAbbr: 'BDT',
  availability: 'Based in Dhaka, Bangladesh (GMT+6). I work well with US clients: 9 AM in New York is 7 PM for me, so morning calls in the US are easy to schedule.',
  email: 'rizwannur116@gmail.com',
  phone: '+880 1534 593 563',
  website: 'https://rizwannur.com',
  avatar: '/rafey.png',
  intro: [
    "I'm Rizwan Nur Rafey, a systems architect from Dhaka, Bangladesh.",
    'I build multi-platform systems across websites, internal tools, automations, dashboards, and custom workflows. If a process can be mapped, improved, and shipped as software, I can help design and build it.',
  ],
  recent: {
    lead: 'Most recently, I worked on',
    company: { name: 'StoryXen', href: 'https://storyxen.com', brand: '#5B3FFF' } as Company,
    tail: ', shipping a fast marketing site and dashboard experience for a Hollywood-facing storytelling platform.',
  },
  past: {
    lead: "Previously, I've also worked with",
    companies: [
      { name: 'PsychLink', href: '#', brand: '#10B981' },
      { name: 'RoofAI', href: '#', brand: '#F97316' },
      { name: 'Trusted Financing', href: '#', brand: '#1E40AF' },
    ] as Company[],
    tail: '.',
  },
  searching:
    "If you need a premium website, a custom workflow, or software that connects the messy parts of your business, I'm available for freelance builds and client work.",
  socials: [
    { label: 'Contra', href: 'https://contra.com/', kind: 'contra' as const },
    { label: 'Twitter', href: 'https://twitter.com/', kind: 'twitter' as const },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/rizwannur', kind: 'linkedin' as const },
    { label: 'GitHub', href: 'https://github.com/', kind: 'github' as const },
    { label: 'Mail', href: 'mailto:rizwannur116@gmail.com', kind: 'mail' as const },
  ],
  bookCall: 'https://cal.com/rizwannur',
}
