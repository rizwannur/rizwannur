export type Work = {
  slug: string
  title: string
  subtitle: string
  cover: string
  date: string
  href?: string
  description: string
  body: string[]
  images?: { src: string; caption?: string }[]
}
