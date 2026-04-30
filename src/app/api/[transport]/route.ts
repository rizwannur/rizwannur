import { createMcpHandler } from 'mcp-handler'
import { registerTools } from '@/lib/mcp/tools'

const mcpHandler = createMcpHandler(
  async (server) => {
    await registerTools(server)
  },
  {},
  { basePath: '/api' },
)

function withAuth(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
    if (!token || token !== process.env.MCP_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
    return handler(req)
  }
}

export const GET = withAuth(mcpHandler)
export const POST = withAuth(mcpHandler)
