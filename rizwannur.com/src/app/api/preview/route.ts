import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Standard Payload live-preview entrypoint.
 *
 * Invoked by Payload's admin Live Preview iframe via
 * `admin.livePreview.url` on the Posts and Work collections. The query
 * params are filled in by Payload at request time:
 *   - collection: 'posts' | 'work'
 *   - slug:       the doc slug
 *   - path:       the destination path (e.g. /thoughts/foo)
 *
 * The route authenticates via Payload's auth cookie. Without a valid
 * admin user it 401s — public visitors can never enable draft mode.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const collection = url.searchParams.get('collection')
  const slug = url.searchParams.get('slug')
  const path = url.searchParams.get('path')

  if (!collection || !slug || !path) {
    return new Response('Missing required preview params: collection, slug, path.', { status: 400 })
  }
  if (collection !== 'posts' && collection !== 'work') {
    return new Response(`Unsupported collection "${collection}".`, { status: 400 })
  }
  if (!path.startsWith('/')) {
    return new Response('path must be an absolute pathname.', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return new Response('Unauthorized — sign in to the Payload admin first.', { status: 401 })
  }

  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: false,
    user,
  })
  if (!docs[0]) {
    return new Response(`Document "${collection}/${slug}" not found.`, { status: 404 })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
