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
  role: 'Product Engineer',
  description:
    'Product Engineer. I design, build, and ship products end-to-end — interface to infrastructure.',
  twitterHandle: 'rafeyum',
  keywords: [
    'Rizwan Nur Rafey',
    'Rafey',
    'Product Engineer',
    'Full-Stack Product Engineer',
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
