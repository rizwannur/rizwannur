import 'dotenv/config'
import { registerTools } from '@/lib/mcp/tools'
import { registerResources } from '@/lib/mcp/resources'
import { registerPrompts } from '@/lib/mcp/prompts'

type Reg = {
  name: string
  meta?: unknown
}

const tools: Reg[] = []
const resources: Reg[] = []
const prompts: Reg[] = []

const stubServer = {
  registerTool(name: string, meta: unknown, _handler: unknown) {
    tools.push({ name, meta })
  },
  registerResource(name: string, _uri: string, meta: unknown, _handler: unknown) {
    resources.push({ name, meta })
  },
  registerPrompt(name: string, meta: unknown, _handler: unknown) {
    prompts.push({ name, meta })
  },
}

await registerTools(stubServer)
await registerResources(stubServer)
await registerPrompts(stubServer)

console.log(`Tools registered (${tools.length}):`)
tools.forEach((t) => console.log(`  - ${t.name}`))

console.log(`\nResources registered (${resources.length}):`)
resources.forEach((r) => console.log(`  - ${r.name}`))

console.log(`\nPrompts registered (${prompts.length}):`)
prompts.forEach((p) => console.log(`  - ${p.name}`))

const expectedTools = [
  'list_posts', 'get_post', 'create_post', 'update_post', 'publish_post', 'unpublish_post', 'delete_post', 'set_post_cover',
  'list_work', 'get_work', 'create_work', 'update_work', 'publish_work', 'unpublish_work', 'delete_work', 'set_work_cover', 'set_work_images',
  'list_craft', 'get_craft', 'create_craft', 'update_craft', 'delete_craft',
  'upload_media', 'list_media', 'get_media', 'update_media', 'delete_media',
  'generate_image', 'check_seo', 'suggest_internal_links', 'preview_post',
  'author_blog_post',
]
const expectedResources = ['Site voice guide', 'SEO rules', 'Image style guide', 'Existing tags', 'Recent posts']
const expectedPrompts = ['write_blog_post', 'optimize_seo', 'refresh_cover_image']

let fail = 0
for (const e of expectedTools) {
  if (!tools.find((t) => t.name === e)) {
    fail += 1
    console.log(`MISSING TOOL: ${e}`)
  }
}
for (const e of expectedResources) {
  if (!resources.find((r) => r.name === e)) {
    fail += 1
    console.log(`MISSING RESOURCE: ${e}`)
  }
}
for (const e of expectedPrompts) {
  if (!prompts.find((p) => p.name === e)) {
    fail += 1
    console.log(`MISSING PROMPT: ${e}`)
  }
}

if (fail > 0) {
  console.log(`\n${fail} expected items missing.`)
  process.exit(1)
}
console.log(`\nAll expected tools/resources/prompts registered. ${tools.length}T / ${resources.length}R / ${prompts.length}P`)
process.exit(0)
