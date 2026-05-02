import { getSiteUrl } from '@/lib/site-url'

export type Section = 'thoughts' | 'work' | 'craft'

export const SECTION_BY_COLLECTION = {
  posts: 'thoughts',
  work: 'work',
  craft: 'craft',
} as const satisfies Record<string, Section>

export function pathFor(section: Section, slug: string): string {
  return `/${section}/${slug}`
}

export function urlFor(section: Section, slug: string): string {
  return `${getSiteUrl()}${pathFor(section, slug)}`
}

export function postUrls(slug: string) {
  return { path: pathFor('thoughts', slug), url: urlFor('thoughts', slug) }
}

export function workUrls(slug: string) {
  return { path: pathFor('work', slug), url: urlFor('work', slug) }
}

export function craftUrls(slug: string) {
  return { path: pathFor('craft', slug), url: urlFor('craft', slug) }
}
