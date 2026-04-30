export type Work = {
  slug: string
  title: string
  subtitle: string
  cover: string
  date: string
  href?: string
  description: string
  body: string[]
  images?: { src: string; caption?: string }[]
}

export const work: Work[] = [
  {
    slug: 'storyxen',
    title: 'StoryXen',
    subtitle: 'Marketing Website',
    cover: '/portfolio/projects/storyxen.png',
    date: 'Mar 2026',
    href: 'https://storyxen.com',
    description:
      'A fast, motion-rich marketing site for an AI-native storytelling platform.',
    body: [
      'StoryXen needed a marketing site that felt as alive as the product it was selling—motion, depth, and clarity in equal measure.',
      'I designed and built the site end-to-end, focusing on a strong typographic hierarchy, scroll-driven reveals, and a hero section that loads fast even on slow connections.',
    ],
    images: [{ src: '/portfolio/projects/storyxen-live.png', caption: 'StoryXen — live' }],
  },
  {
    slug: 'roofai',
    title: 'RoofAI',
    subtitle: 'Web Dashboard',
    cover: '/portfolio/projects/roofing.png',
    date: 'Jan 2026',
    description: 'A dashboard for roofing contractors to estimate jobs from satellite imagery.',
    body: [
      'RoofAI turns aerial imagery into accurate roof measurements in seconds. The challenge was making a deeply technical product feel approachable.',
      'I built the dashboard shell, the imagery overlay UI, and the estimate-builder—optimizing every interaction so reps could quote a job in under a minute.',
    ],
    images: [{ src: '/portfolio/projects/roofai-live.png' }],
  },
  {
    slug: 'psychlink',
    title: 'PsychLink',
    subtitle: 'Patient Portal',
    cover: '/portfolio/projects/psyche-connect.png',
    date: 'Nov 2025',
    description: 'A calm, focused portal connecting patients with mental health providers.',
    body: [
      'Mental health products live or die by trust. PsychLink needed an interface that disappeared—nothing flashy, nothing pushy.',
      'I led the frontend rewrite from a brittle template into a typed, accessible Next.js app with a small, reusable component set.',
    ],
    images: [{ src: '/portfolio/projects/psychlink-live.png' }],
  },
  {
    slug: 'trusted-financing',
    title: 'Trusted Financing',
    subtitle: 'Marketing Website',
    cover: '/portfolio/projects/trusted-financing-live.png',
    date: 'Sep 2025',
    description: 'A trust-first marketing site for a consumer finance product.',
    body: [
      'Finance brands fight an uphill battle on credibility. The goal was a site that felt grown-up without feeling stiff.',
      'Clean grid, generous whitespace, restrained motion, and copy that does the heavy lifting.',
    ],
  },
  {
    slug: 'aura',
    title: 'Aura',
    subtitle: 'Mobile App Landing',
    cover: '/portfolio/projects/aura.png',
    date: 'Jul 2025',
    description: 'Landing page for a wellness app focused on quiet rituals.',
    body: [
      'Aura is a wellness app and the landing page had to feel like a deep breath.',
      'Soft gradients, slow motion, and a single call to action carried the whole experience.',
    ],
    images: [{ src: '/portfolio/projects/auraa-live.png' }],
  },
  {
    slug: 'lawyer-connect',
    title: 'Lawyer Connect',
    subtitle: 'Web Platform',
    cover: '/portfolio/projects/lawyer-connect.png',
    date: 'May 2025',
    description: 'A directory and intake platform for independent attorneys.',
    body: [
      'A platform for clients to find and intake with attorneys quickly. The hardest part was the form: long, stateful, easy to abandon.',
      'I rebuilt it as a multi-step flow with autosave and clear progress, lifting completion meaningfully.',
    ],
  },
  {
    slug: 'financial-crm',
    title: 'Financial CRM',
    subtitle: 'Internal Tool',
    cover: '/portfolio/projects/financial-crm.png',
    date: 'Feb 2025',
    description: 'A focused CRM for a small advisory firm.',
    body: [
      'A small team, a lot of clients, and spreadsheets everywhere. They needed a tool that felt like theirs.',
      'I shipped a tightly-scoped CRM—pipelines, contacts, notes—built to be lived in.',
    ],
  },
]
