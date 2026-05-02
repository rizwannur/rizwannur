/**
 * Root-domain SEO is defined here in code, not from Payload, so the
 * homepage embed never depends on a CMS query and stays consistent across
 * deploys and cache invalidations. Per-post and per-work pages still draw
 * from the Payload SEO plugin (see buildPageMetadata) — only the root and
 * unscoped fallbacks live here.
 *
 * Edit these constants directly when the headline changes.
 */

export const SITE_META = {
  fullName: 'Rizwan Nur Rafey',
  shortName: 'Rafey',
  role: 'Full-Stack Product Engineer',
  description:
    'Full-Stack Product Engineer. I design and ship web products end-to-end — from UX to deploy.',
  twitterHandle: 'rizwannur',
  keywords: [
    'Rizwan Nur Rafey',
    'Rafey',
    'Full-Stack Product Engineer',
    'Product Engineer',
    'Full-Stack Engineer',
    'Web Developer',
    'Next.js',
    'TypeScript',
    'Portfolio',
  ],
} as const

export function rootTitle(): string {
  return `${SITE_META.shortName} — ${SITE_META.role}`
}
