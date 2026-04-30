import { createMcpHandler } from 'mcp-handler'
import { timingSafeEqual } from 'node:crypto'
import { registerTools } from '@/lib/mcp/tools'
import { rateLimit } from '@/lib/analytics/rateLimit'

// Single-endpoint mount at /mcp. mcp-handler's basePath convention adds
// `/mcp` to whatever you pass, so basePath '' makes its streamable HTTP
// endpoint resolve to `/mcp` — exactly what this route file serves.
const mcpHandler = createMcpHandler(
  async (server) => {
    await registerTools(server)
  },
  {},
  { basePath: '' },
)

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '0.0.0.0'
}

function tokensMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withAuth(handler: (req: Request, context?: any) => Promise<Response>) {
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

    const expected = process.env.MCP_SECRET
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
    if (!expected || !token || !tokensMatch(token, expected)) {
      return new Response('Unauthorized', { status: 401 })
    }
    return handler(req, context)
  }
}

export const GET = withAuth(mcpHandler)
export const POST = withAuth(mcpHandler)
