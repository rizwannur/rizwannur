import { createMcpHandler } from 'mcp-handler'
import { registerTools } from '@/lib/mcp/tools'

const mcpHandler = createMcpHandler(
  async (server) => {
    await registerTools(server)
  },
  {},
  { basePath: '/api' },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withAuth(handler: (req: Request, context?: any) => Promise<Response>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: Request, context?: any): Promise<Response> => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
    if (!token || token !== process.env.MCP_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
    return handler(req, context)
  }
}

export const GET = withAuth(mcpHandler)
export const POST = withAuth(mcpHandler)
