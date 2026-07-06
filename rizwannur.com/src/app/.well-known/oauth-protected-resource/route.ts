import { protectedResourceHandler, metadataCorsOptionsRequestHandler } from 'mcp-handler'

const authServerUrl = process.env.WORKOS_AUTHKIT_DOMAIN?.replace(/\/$/, '') ?? ''
const resourceUrl = process.env.MCP_RESOURCE_URL?.replace(/\/$/, '') ?? ''

const handler = protectedResourceHandler({
  authServerUrls: authServerUrl ? [authServerUrl] : [],
  ...(resourceUrl ? { resourceUrl } : {}),
})

export const GET = handler
export const OPTIONS = metadataCorsOptionsRequestHandler()
