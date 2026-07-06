import { pathFor, urlFor, type Section } from './urls'

export function buildPreviewUrl(args: { slug: string; section?: Section; baseUrl?: string }): string {
  const section = args.section ?? 'thoughts'
  if (args.baseUrl) {
    return `${args.baseUrl.replace(/\/$/, '')}${pathFor(section, args.slug)}`
  }
  return urlFor(section, args.slug)
}
