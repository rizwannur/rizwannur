export type Thought = {
  slug: string
  title: string
  date: string
  readTime: string
  excerpt: string
  body: string[]
  coverImage?: { url: string; alt: string } | null
  tags?: string[]
}
