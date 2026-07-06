import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteUrl } from '@/lib/site-url'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const payload = await getPayload({ config })

  const [{ docs: posts }, { docs: works }, { docs: crafts }] = await Promise.all([
    payload.find({ collection: 'posts', limit: 200, depth: 0, where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'work', limit: 200, depth: 0, where: { _status: { equals: 'published' } } }).catch(() => ({ docs: [] as Array<{ slug: string; updatedAt?: string }> })),
    payload.find({ collection: 'craft', limit: 200, depth: 0 }).catch(() => ({ docs: [] as Array<{ slug: string; updatedAt?: string }> })),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/work`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/thoughts`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/craft`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/thoughts/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const workRoutes: MetadataRoute.Sitemap = works.map((w) => ({
    url: `${siteUrl}/work/${w.slug}`,
    lastModified: w.updatedAt ? new Date(w.updatedAt) : undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const craftRoutes: MetadataRoute.Sitemap = crafts.map((c) => ({
    url: `${siteUrl}/craft/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...postRoutes, ...workRoutes, ...craftRoutes]
}
