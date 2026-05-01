import { jwtVerify, createRemoteJWKSet } from 'jose'
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import { timingSafeEqual } from 'node:crypto'

const authkitDomain = process.env.WORKOS_AUTHKIT_DOMAIN?.replace(/\/$/, '') ?? ''
const resourceUrl = process.env.MCP_RESOURCE_URL?.replace(/\/$/, '') ?? ''
const staticSecret = process.env.MCP_SECRET ?? ''

const JWKS = authkitDomain
  ? createRemoteJWKSet(new URL(`${authkitDomain}/oauth2/jwks`))
  : null

function tokensMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function verifyToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined

  // Static secret path — Cursor / Claude Desktop via mcp-remote stdio bridge.
  if (staticSecret && tokensMatch(bearerToken, staticSecret)) {
    return { token: bearerToken, scopes: ['mcp:full'], clientId: 'stdio-static' }
  }

  // OAuth JWT from WorkOS AuthKit — Claude.ai web, ChatGPT, any HTTP MCP client.
  if (!JWKS || !authkitDomain || !resourceUrl) return undefined
  try {
    const { payload } = await jwtVerify(bearerToken, JWKS, {
      issuer: authkitDomain,
      audience: resourceUrl,
    })
    return {
      token: bearerToken,
      scopes: ['mcp:full'],
      clientId: (payload.client_id as string) ?? 'workos-oauth',
      extra: { sub: payload.sub, sid: payload.sid },
    }
  } catch {
    return undefined
  }
}
