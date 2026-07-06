import OpenGraphImage from './opengraph-image'
import { SITE_META } from '@/lib/site-meta'

export const runtime = 'nodejs'
export const alt = `${SITE_META.fullName} — ${SITE_META.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default OpenGraphImage
