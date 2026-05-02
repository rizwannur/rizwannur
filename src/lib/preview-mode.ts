import { draftMode } from 'next/headers'

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
