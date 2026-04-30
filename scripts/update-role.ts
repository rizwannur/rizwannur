import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

const updated = await payload.updateGlobal({
  slug: 'profile',
  data: { role: 'Full-Stack Product Engineer' },
  overrideAccess: true,
})

console.log('role:', updated.role)

export {}
