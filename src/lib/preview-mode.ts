import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Returns true when Next.js draft mode is on. Draft mode is only enabled
 * by the /api/preview route, which requires a valid Payload admin cookie.
 *
 * This means:
 *   - public visitors: draft mode off → page renders the published version
 *   - admin via Payload Live Preview iframe: draft mode on → page renders
 *     the latest in-progress version
 *
 * Pages that read this stay statically generated for public traffic and
 * only switch to dynamic when an admin opts in.
 */
export async function isDraftPreview(): Promise<boolean> {
  try {
    const draft = await draftMode()
    return draft.isEnabled
  } catch {
    return false
  }
}

/**
 * Returns true when the request comes from a logged-in Payload admin.
 * Lets public pages opt admins into seeing drafts without requiring them
 * to click the Preview button — anyone signed into the CMS sees the same
 * latest version they would in the admin UI.
 */
export async function isAuthedAdmin(): Promise<boolean> {
  try {
    const payload = await getPayload({ config })
    const reqHeaders = await headers()
    const { user } = await payload.auth({ headers: reqHeaders })
    return Boolean(user)
  } catch {
    return false
  }
}
