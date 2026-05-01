export function buildPreviewUrl(args: { slug: string; baseUrl?: string }): string {
  const base = args.baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  // Posts auto-revalidate; for drafts, slug page renders if user is authed in admin.
  // Return the public slug URL — admin users see drafts; everyone else sees published.
  return `${base.replace(/\/$/, '')}/thoughts/${args.slug}`
}
