import type { Redirect } from 'next/dist/lib/load-custom-routes'

export const redirects = async (): Promise<Redirect[]> => {
  try {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'redirects',
      limit: 0,
      depth: 1,
      overrideAccess: true,
    })

    return docs.reduce<Redirect[]>((acc, r) => {
      if (!r.from) return acc
      const to = r.to as { url?: string } | undefined
      if (!to?.url) return acc
      return [
        ...acc,
        {
          source: r.from,
          destination: to.url,
          permanent: r.type !== '302',
        },
      ]
    }, [])
  } catch {
    return []
  }
}
