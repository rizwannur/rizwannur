# Payload CMS MCP Server — Design Spec
**Date:** 2026-04-30

## Overview

An MCP (Model Context Protocol) server hosted inside the existing Next.js app at `rizwannur.xyz`. Any AI agent (Claude Desktop, Claude Code, Cursor, etc.) can connect to it and manage all site content — write blog posts, update work items, add craft entries — through natural conversation.

---

## Goals

- Full CRUD on `posts`, `work`, and `craft` Payload collections
- Read-only access to `media` (list uploaded files to reference as cover images)
- All tool descriptions are detailed enough for any AI agent to understand and use without extra context
- Markdown in, Markdown out for all rich-text body fields (agent never sees Lexical JSON)
- Secured with a single static bearer token (`MCP_SECRET` env var)

## Non-Goals

- Profile global management (excluded by design)
- Media file uploads (binary data over MCP text protocol is impractical)
- OAuth or multi-user auth (single-user personal site)

---

## Architecture

### Files

```
src/app/api/[transport]/route.ts   ← mcp-handler route handler (auth + wires tools)
src/lib/mcp/tools.ts               ← all 16 tool definitions, organised by collection
```

No other files are modified.

### Request Flow

```
AI Agent → POST /api/mcp
             ↓
        route.ts: checks Authorization: Bearer <MCP_SECRET>
             ↓ fail → 401 Unauthorized
        createMcpHandler: calls registerTools(server)
             ↓
        tool executes → getPayload({ config }) → payload.find / create / update / delete
             ↓
        result returned as MCP text content to agent
```

### Auth

Bearer token check on every request. `MCP_SECRET` is a 32-byte hex string set as a Vercel environment variable. The check happens before any Payload operation. Payload operations run with `overrideAccess: true` since auth is handled at the MCP layer.

### Rich Text (Markdown ↔ Lexical)

Payload stores `body` fields as Lexical JSON internally. The tools use Payload's `@payloadcms/richtext-lexical` converters:

- **Write (create/update):** `body` input is a Markdown string → `convertMarkdownToLexical()` → stored as Lexical JSON
- **Read (get):** Lexical JSON → `convertLexicalToMarkdown()` → returned as Markdown string

The agent always sees and writes plain Markdown. The conversion is invisible.

---

## Tool List (16 tools)

### Posts

| Tool | Description |
|------|-------------|
| `list_posts` | List all posts sorted newest-first. Returns `id`, `slug`, `title`, `date`, `readTime`, `excerpt`. Inputs: `limit?` (default 20), `page?` (default 1) |
| `get_post` | Full post content including `body` as Markdown. Inputs: `slug` |
| `create_post` | Create a new post. `body` is Markdown. `slug` auto-generated from `title` if omitted. `date` defaults to today. Inputs: `title`, `excerpt`, `body`, `readTime`, `date?`, `slug?` |
| `update_post` | Partial update by `id`. Only provided fields change. `body` as Markdown. Inputs: `id` + any of `title?`, `excerpt?`, `body?`, `readTime?`, `date?` |
| `delete_post` | Permanent delete by `id`. Irreversible. Inputs: `id` |

### Work

| Tool | Description |
|------|-------------|
| `list_work` | List all work items sorted by `order` ascending. Returns `id`, `slug`, `title`, `subtitle`, `description`, `date`, `href`, `order`. Inputs: none |
| `get_work` | Full work item including `body` as Markdown. Inputs: `slug` |
| `create_work` | Create a new project. `subtitle` e.g. `"Marketing Website"`. `description` is the card one-liner. `body` is full writeup in Markdown. `order` lower = higher on page. Inputs: `title`, `subtitle`, `description`, `body`, `date`, `order?`, `href?`, `slug?` |
| `update_work` | Partial update by `id`. Inputs: `id` + any of `title?`, `subtitle?`, `description?`, `body?`, `date?`, `order?`, `href?` |
| `delete_work` | Permanent delete by `id`. Inputs: `id` |

### Craft

| Tool | Description |
|------|-------------|
| `list_craft` | List all craft items sorted by `order` ascending. Returns `id`, `slug`, `title`, `date`, `description`, `order`. Inputs: none |
| `get_craft` | Full craft item details. Inputs: `slug` |
| `create_craft` | Create a new craft item. Keep `description` to one punchy sentence. `credit` is optional attribution. Inputs: `title`, `description`, `date`, `order?`, `slug?`, `credit?` (`{ name, href? }`) |
| `update_craft` | Partial update by `id`. Inputs: `id` + any of `title?`, `description?`, `date?`, `order?`, `credit?` |
| `delete_craft` | Permanent delete by `id`. Inputs: `id` |

### Media

| Tool | Description |
|------|-------------|
| `list_media` | List uploaded media files. Returns `id`, `filename`, `url`, `alt`, `mimeType`. Use the `id` to assign a cover to a work/craft item. Inputs: `limit?` (default 20) |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MCP_SECRET` | 32-byte hex bearer token. Generate with `openssl rand -hex 32`. Set in Vercel project settings and locally in `.env.local`. |

---

## MCP Client Config (how to connect an agent)

Once deployed, agents connect with:

```json
{
  "mcpServers": {
    "rizwannur": {
      "url": "https://rizwannur.xyz/api/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_SECRET value>"
      }
    }
  }
}
```

For Claude Code (local dev), point at `http://localhost:3000/api/mcp` with the same header.

---

## Dependencies

- `mcp-handler` — already researched, install via `bun add mcp-handler @modelcontextprotocol/sdk zod`
- `@payloadcms/richtext-lexical` — already installed (used by Posts collection)

---

## Out of Scope (future)

- Media upload tool (requires multipart/base64 handling)
- Profile global tools
- Draft/publish workflow (all creates go live immediately)
- Search/filter tools beyond basic pagination
