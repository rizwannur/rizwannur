import 'dotenv/config'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '@/lib/mcp/lexical'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SEED_POSTS_PATH = process.env.SEED_POSTS_PATH || 'C:/Users/Rafey/AppData/Local/Temp/seed-posts.json'

type Post = {
  title: string
  slug: string
  date: string
  readTime: string
  excerpt: string
  tags: string[]
  body: string
}

async function uploadIfMissing(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filePath: string,
  alt: string,
): Promise<string | null> {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ! file missing: ${filePath}`)
    return null
  }
  const filename = path.basename(filePath)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return String(existing.docs[0].id)
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filename).slice(1).toLowerCase()
  const mimetype =
    ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : ext === 'webp'
        ? 'image/webp'
        : `image/${ext}`
  try {
    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype, name: filename, size: data.length },
      overrideAccess: true,
    })
    return String(media.id)
  } catch (err) {
    const msg = (err as Error)?.message ?? ''
    console.warn(`  ! upload failed for ${filename}: ${msg.slice(0, 120)}`)
    return null
  }
}

async function seedProfile(payload: Awaited<ReturnType<typeof getPayload>>) {
  const heroPath = path.resolve(__dirname, '..', 'public', 'portfolio', 'hero-pfp.png')
  const avatarId = await uploadIfMissing(payload, heroPath, 'Rafey')

  await payload.updateGlobal({
    slug: 'profile',
    data: {
      shortName: 'Rafey',
      fullName: 'Rizwan Nur Rafey',
      role: 'Full-Stack Product Engineer',
      ...(avatarId ? { avatar: avatarId } : {}),
      headline:
        'I architect software that takes you from idea to production. Stable, scalable, and earning revenue.',
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
      socials: [
        { label: 'Twitter', href: 'https://x.com/rafeyum', kind: 'twitter' },
        { label: 'Instagram', href: 'https://instagram.com/rafeyum', kind: 'instagram' },
        { label: 'GitHub', href: 'https://github.com/rizwannur', kind: 'github' },
        { label: 'LinkedIn', href: 'https://linkedin.com/in/rizwannur', kind: 'linkedin' },
        {
          label: 'Resume',
          href: 'https://docs.google.com/document/d/15W39xx3tRk7Cdbk690ODD9yLBJv9xZvq/edit?usp=sharing&ouid=103439662159800937701&rtpof=true&sd=true',
          kind: 'resume',
        },
        { label: 'Mail', href: 'mailto:rizwannur116@gmail.com', kind: 'mail' },
      ],
      timezone: 'Asia/Dhaka',
      timezoneAbbr: 'BDT',
    },
    overrideAccess: true,
  })
  console.log('  ✓ profile')
}

async function seedWork(payload: Awaited<ReturnType<typeof getPayload>>) {
  const slug = 'storyxen'
  const existing = await payload.find({
    collection: 'work',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    console.log('  · storyxen already exists, skipping')
    return
  }
  const body = await markdownToLexical(
    [
      'StoryXen is production planning software for independent film teams — script breakdowns, schedules, budgets, and reporting that all speak the same language.',
      '',
      'I designed and shipped the marketing site end-to-end. Motion-rich hero, scroll-driven product breakdown, and a fast first paint even on slow connections.',
    ].join('\n'),
    { collection: 'work', field: 'body' },
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (payload.create as any)({
    collection: 'work',
    data: {
      title: 'StoryXen',
      slug,
      subtitle: 'Marketing Website',
      date: 'Apr 2026',
      href: 'https://storyxen.com',
      description:
        'A motion-rich marketing site for production planning software built for independent film.',
      tech: ['Next.js', 'Tailwind', 'Motion'],
      body,
      order: 1,
    },
    overrideAccess: true,
  })
  console.log('  ✓ storyxen')
}

async function seedPosts(payload: Awaited<ReturnType<typeof getPayload>>) {
  if (!fs.existsSync(SEED_POSTS_PATH)) {
    console.warn(`  ! seed-posts.json missing at ${SEED_POSTS_PATH}, skipping`)
    return
  }
  const { posts } = JSON.parse(fs.readFileSync(SEED_POSTS_PATH, 'utf8')) as { posts: Post[] }
  for (const p of posts) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: p.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      console.log(`  · ${p.slug} exists, skipping`)
      continue
    }
    const body = await markdownToLexical(p.body, { collection: 'posts', field: 'body' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (payload.create as any)({
      collection: 'posts',
      data: {
        title: p.title,
        slug: p.slug,
        date: p.date,
        readTime: p.readTime,
        excerpt: p.excerpt,
        tags: p.tags,
        body,
        _status: 'published',
      },
      overrideAccess: true,
    })
    console.log(`  ✓ ${p.slug}`)
  }
}

async function main() {
  const payload = await getPayload({ config })
  console.log('Seeding profile...')
  await seedProfile(payload)
  console.log('Seeding work...')
  await seedWork(payload)
  console.log('Seeding posts...')
  await seedPosts(payload)
  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
