export type Work = {
  slug: string
  title: string
  subtitle: string
  cover: string
  coverWidth?: number
  coverHeight?: number
  date: string
  href?: string
  description: string
  body: string[]
  images?: { src: string; caption?: string; width?: number; height?: number }[]
}
