import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from './payload.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function lexical(paragraphs: string[]) {
  return {
    root: {
      type: 'root' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph' as const,
        children: [{ type: 'text' as const, text, version: 1 as const }],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1 as const,
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1 as const,
    },
  }
}

async function createMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
  alt: string,
) {
  const filePath = path.resolve(__dirname, '../public/portfolio/projects', filename)
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ image not found: ${filename}, skipping cover`)
    return undefined
  }
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filename).slice(1).toLowerCase()
  const mimetype = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype, name: filename, size: data.length },
  })
  return media.id as number
}

async function seedProfile(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Seeding profile...')

  const avatarPath = path.resolve(__dirname, '../public/rafey.png')
  let avatarId: number | undefined
  if (fs.existsSync(avatarPath)) {
    const data = fs.readFileSync(avatarPath)
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Rafey profile photo' },
      file: { data, mimetype: 'image/png', name: 'rafey.png', size: data.length },
    })
    avatarId = media.id as number
  }

  await payload.updateGlobal({
    slug: 'profile',
    data: {
      shortName: 'Rafey',
      fullName: 'Rizwan Nur Rafey',
      role: 'Systems Architect | Multi-Platform Systems',
      avatar: avatarId,
      headline:
        'I architect software that takes you from idea to production — stable, scalable, and earning revenue.',
      intro: [
        {
          text: "I'm Rizwan Nur Rafey, a systems architect from Dhaka, Bangladesh. I design systems, ship critical infrastructure, and own delivery across frontend, backend, APIs, and infra.",
        },
        {
          text: "Most teams don't need another pair of hands — they need someone who can see the whole system, make the hard technical calls, and keep the build moving. That's the work I take on.",
        },
      ],
      recent: {
        lead: 'Most recently I shipped',
        company: { name: 'StoryXen', href: 'https://storyxen.com', brand: '#5B3FFF' },
        tail: ' — production planning software for independent film, with a fast marketing site and dashboard built to launch.',
      },
      past: {
        lead: 'Past work includes',
        companies: [
          { name: 'Auraa', href: '#', brand: '#9333EA' },
          { name: 'PsycheConnect', href: '#', brand: '#10B981' },
          { name: 'RoofAI', href: '#', brand: '#F97316' },
          { name: 'Trusted Financing', href: '#', brand: '#1E40AF' },
        ],
        tail: '.',
      },
      searching:
        "If you have a vague, evolving idea and need someone to turn it into a production-ready system, I take on a small number of freelance and embedded engagements each quarter. Let's talk.",
      availability:
        'Based in Dhaka, Bangladesh (GMT+6). I work well with US clients: 9 AM in New York is 7 PM for me, so morning calls in the US are easy to schedule.',
      bookCall: 'https://cal.com/rizwannur',
      timezone: 'Asia/Dhaka',
      timezoneAbbr: 'BDT',
      socials: [
        { label: 'Twitter', href: 'https://x.com/rafeyum', kind: 'twitter' },
        { label: 'Instagram', href: 'https://instagram.com/rafeyum', kind: 'instagram' },
        { label: 'GitHub', href: 'https://github.com/rizwannur', kind: 'github' },
        { label: 'LinkedIn', href: 'https://linkedin.com/in/rizwannur', kind: 'linkedin' },
        {
          label: 'Resume',
          href: 'https://docs.google.com/document/d/15W39xx3tRk7Cdbk690ODD9yLBJv9xZvq/edit',
          kind: 'resume',
        },
        { label: 'Mail', href: 'mailto:rizwannur116@gmail.com', kind: 'mail' },
      ],
    },
  })
  console.log('  Profile seeded ✓')
}

async function seed() {
  const payload = await getPayload({ config })

  const { totalDocs: existingWork } = await payload.find({ collection: 'work', limit: 1 })
  const { totalDocs: existingPosts } = await payload.find({ collection: 'posts', limit: 1 })

  if (existingWork > 0 || existingPosts > 0) {
    console.log(`Already seeded (${existingWork} work items, ${existingPosts} posts). Exiting.`)
    process.exit(0)
  }

  console.log('Seeding work items...')

  const workData = [
    {
      slug: 'storyxen',
      title: 'StoryXen',
      subtitle: 'Marketing Website',
      cover: 'storyxen.png',
      date: 'Mar 2026',
      href: 'https://storyxen.com',
      description: 'A fast, motion-rich marketing site for an AI-native storytelling platform.',
      body: [
        'StoryXen needed a marketing site that felt as alive as the product it was selling—motion, depth, and clarity in equal measure.',
        'I designed and built the site end-to-end, focusing on a strong typographic hierarchy, scroll-driven reveals, and a hero section that loads fast even on slow connections.',
      ],
      order: 1,
    },
    {
      slug: 'roofai',
      title: 'RoofAI',
      subtitle: 'Web Dashboard',
      cover: 'roofing.png',
      date: 'Jan 2026',
      description: 'A dashboard for roofing contractors to estimate jobs from satellite imagery.',
      body: [
        'RoofAI turns aerial imagery into accurate roof measurements in seconds. The challenge was making a deeply technical product feel approachable.',
        'I built the dashboard shell, the imagery overlay UI, and the estimate-builder—optimizing every interaction so reps could quote a job in under a minute.',
      ],
      order: 2,
    },
    {
      slug: 'psychlink',
      title: 'PsychLink',
      subtitle: 'Patient Portal',
      cover: 'psyche-connect.png',
      date: 'Nov 2025',
      description: 'A calm, focused portal connecting patients with mental health providers.',
      body: [
        'Mental health products live or die by trust. PsychLink needed an interface that disappeared—nothing flashy, nothing pushy.',
        'I led the frontend rewrite from a brittle template into a typed, accessible Next.js app with a small, reusable component set.',
      ],
      order: 3,
    },
    {
      slug: 'trusted-financing',
      title: 'Trusted Financing',
      subtitle: 'Marketing Website',
      cover: 'trusted-financing-live.png',
      date: 'Sep 2025',
      description: 'A trust-first marketing site for a consumer finance product.',
      body: [
        'Finance brands fight an uphill battle on credibility. The goal was a site that felt grown-up without feeling stiff.',
        'Clean grid, generous whitespace, restrained motion, and copy that does the heavy lifting.',
      ],
      order: 4,
    },
    {
      slug: 'aura',
      title: 'Aura',
      subtitle: 'Mobile App Landing',
      cover: 'aura.png',
      date: 'Jul 2025',
      description: 'Landing page for a wellness app focused on quiet rituals.',
      body: [
        'Aura is a wellness app and the landing page had to feel like a deep breath.',
        'Soft gradients, slow motion, and a single call to action carried the whole experience.',
      ],
      order: 5,
    },
    {
      slug: 'lawyer-connect',
      title: 'Lawyer Connect',
      subtitle: 'Web Platform',
      cover: 'lawyer-connect.png',
      date: 'May 2025',
      description: 'A directory and intake platform for independent attorneys.',
      body: [
        'A platform for clients to find and intake with attorneys quickly. The hardest part was the form: long, stateful, easy to abandon.',
        'I rebuilt it as a multi-step flow with autosave and clear progress, lifting completion meaningfully.',
      ],
      order: 6,
    },
    {
      slug: 'financial-crm',
      title: 'Financial CRM',
      subtitle: 'Internal Tool',
      cover: 'financial-crm.png',
      date: 'Feb 2025',
      description: 'A focused CRM for a small advisory firm.',
      body: [
        'A small team, a lot of clients, and spreadsheets everywhere. They needed a tool that felt like theirs.',
        'I shipped a tightly-scoped CRM—pipelines, contacts, notes—built to be lived in.',
      ],
      order: 7,
    },
  ]

  for (const item of workData) {
    process.stdout.write(`  Creating "${item.title}"...`)
    const coverId = await createMedia(payload, item.cover, `${item.title} cover`)
    await payload.create({
      collection: 'work',
      data: {
        title: item.title,
        slug: item.slug,
        subtitle: item.subtitle,
        cover: coverId as number,
        date: item.date,
        href: item.href,
        description: item.description,
        body: lexical(item.body),
        order: item.order,
      },
    })
    console.log(' ✓')
  }

  console.log('\nSeeding posts...')

  const postsData = [
    {
      slug: 'building-a-fast-portfolio-with-nextjs',
      title: 'Building a fast portfolio with Next.js',
      date: '2026-04-01',
      readTime: '6 min read',
      excerpt: 'Notes on shipping a portfolio that loads instantly and still feels alive.',
      body: [
        "Speed and personality are usually treated like opposites. They aren't.",
        "A portfolio that loads instantly buys you the right to be a little bit weird—you've already paid the politeness tax in performance, so you can spend the rest on craft.",
        'In this post I walk through the choices that kept this site under 100 KB of JS while still having the animations and audio I wanted.',
      ],
    },
    {
      slug: 'view-transitions-for-theme-switching',
      title: 'Using View Transitions for theme switching',
      date: '2026-03-01',
      readTime: '8 min read',
      excerpt:
        'A circular wipe between light and dark with the View Transitions API and zero libraries.',
      body: [
        'The View Transitions API is one of those quiet, recent additions to the platform that lets you do things that used to require a small ML of JS.',
        'I show how to wire it up in a Next.js app with next-themes, and how to make the wipe feel intentional rather than gimmicky.',
      ],
    },
    {
      slug: 'why-i-care-about-craft',
      title: 'Why I care about craft',
      date: '2026-02-01',
      readTime: '5 min read',
      excerpt:
        'A short essay on the kind of attention that separates good interfaces from great ones.',
      body: [
        "Craft is the part you notice when it's done right and miss when it's not.",
        "It's the easing curve on a button, the empty state that doesn't feel empty, the loading spinner that admits something is taking too long.",
      ],
    },
    {
      slug: 'a-quiet-design-system',
      title: 'A quiet design system',
      date: '2026-01-01',
      readTime: '7 min read',
      excerpt: 'On building component libraries that recede into the background—on purpose.',
      body: [
        'The best design systems disappear. You stop noticing them, and you start noticing the products built on top.',
        "Here's how I think about token layering, escape hatches, and the decisions that decide whether a system gets adopted or quietly worked around.",
      ],
    },
  ]

  for (const item of postsData) {
    process.stdout.write(`  Creating "${item.title}"...`)
    await payload.create({
      collection: 'posts',
      data: {
        title: item.title,
        slug: item.slug,
        date: item.date,
        readTime: item.readTime,
        excerpt: item.excerpt,
        body: lexical(item.body),
      },
    })
    console.log(' ✓')
  }

  await seedProfile(payload)

  console.log('\nDone! Seeded 7 work items, 4 posts, and profile.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
