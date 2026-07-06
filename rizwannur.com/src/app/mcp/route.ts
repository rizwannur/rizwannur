import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import { registerTools } from '@/lib/mcp/tools'
import { registerResources } from '@/lib/mcp/resources'
import { registerPrompts } from '@/lib/mcp/prompts'
import { verifyToken } from '@/lib/mcp/auth'
import { rateLimit } from '@/lib/analytics/rateLimit'

// Single-endpoint mount at /mcp. mcp-handler's basePath convention adds
// `/mcp` to whatever you pass, so basePath '' makes its streamable HTTP
// endpoint resolve to `/mcp` — exactly what this route file serves.
const mcpHandler = createMcpHandler(
  async (server) => {
    await registerTools(server)
    await registerResources(server)
    await registerPrompts(server)
  },
  {},
  { basePath: '' },
)

const authedHandler = withMcpAuth(mcpHandler, verifyToken, {
  required: true,
  resourceMetadataPath: '/.well-known/oauth-protected-resource',
})

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '0.0.0.0'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withRateLimit(handler: (req: Request, context?: any) => Promise<Response>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: Request, context?: any): Promise<Response> => {
    const ip = getClientIp(req)
    const limit = rateLimit(`mcp:${ip}`)
    if (!limit.ok) {
      return new Response('Too many requests', {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSec) },
      })
    }
    return handler(req, context)
  }
}

export const GET = withRateLimit(authedHandler)
export const POST = withRateLimit(authedHandler)
