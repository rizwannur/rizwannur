import { getPayload } from 'payload'
import config from '@payload-config'

export type LinkSuggestion = {
  slug: string
  title: string
  excerpt: string
  score: number
  suggestedAnchorText: string
}

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','of','in','on','at','to','for','with','from','by','is','are','was','were','be','been','being','it','this','that','these','those','i','you','we','they','he','she','as','if','then','than','so','not','no','yes','will','would','can','could','should','have','has','had','do','does','did','about','your','my','our','their','its',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  )
}

export async function suggestInternalLinks(args: {
  body: string
  excludeSlug?: string
  limit?: number
}): Promise<LinkSuggestion[]> {
  const { body, excludeSlug, limit = 5 } = args
  const draftTokens = tokenize(body)
  if (draftTokens.size === 0) return []

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-date',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const scored: LinkSuggestion[] = []
  for (const post of docs) {
    if (post.slug === excludeSlug) continue
    const targetText = `${post.title} ${post.excerpt} ${(post.tags as string[] | undefined)?.join(' ') ?? ''}`
    const targetTokens = tokenize(targetText)
    let overlap = 0
    for (const t of targetTokens) if (draftTokens.has(t)) overlap += 1
    if (overlap < 2) continue
    scored.push({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      score: overlap,
      suggestedAnchorText: post.title,
    })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}
