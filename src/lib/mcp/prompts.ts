import { z } from 'zod'

const WRITE_BLOG_POST = (args: { topic: string; angle?: string; target_length?: string }) => `
You are authoring a blog post for Rafey's site.

## Step 1 — Load context (read these resources)
- site://voice
- site://seo-rules
- site://image-style
- site://existing-tags
- site://recent-posts

## Step 2 — Plan
Topic: ${args.topic}
Angle: ${args.angle ?? '(decide based on voice + recent posts)'}
Target length: ${args.target_length ?? '~1000 words'}

Write an outline (4–7 sections). Mark sections that benefit from an inline image with [IMG].

## Step 3 — Draft
Write the full body in markdown using site voice. For each [IMG] section, place an ![alt text](IMG_N) placeholder. Number sequentially: IMG_1, IMG_2, etc.

## Step 4 — Plan images
For each placeholder, write a generation prompt that aligns with site://image-style.
Also write a cover image prompt summarizing the post's hook.

## Step 5 — SEO + tags
Compose meta title (30–60 chars) and meta description (70–160 chars).
Pick 2–4 tags. Prefer tags from site://existing-tags. Justify any new tag.

## Step 6 — One call
Call \`author_blog_post\` with everything assembled:
- coverImage: { generate: { prompt, alt, aspectRatio: '16:9' } }
- inlineImages: { IMG_1: { generate: { prompt, alt } }, ... }
- seo, tags, body, etc.
- status: 'draft'

## Step 7 — Recover from errors
If response contains \`error.partial\`, fix the cited issue and retry. Always pass \`partial\` so already-generated images aren't regenerated.

## Step 8 — Hand off
Share \`previewUrl\` (which uses /thoughts/{slug} — the site has no /blog route) with the user. On their approval, call \`publish_post\` with the post id.
`

const OPTIMIZE_SEO = (args: { post_id: string }) => `
Optimize SEO for post ${args.post_id}.

1. Call \`get_post\` with id ${args.post_id} to read current state.
2. Call \`check_seo\` with the post's fields.
3. For each fail/warn, propose a specific fix. Summarize the diff.
4. Wait for user approval.
5. On approval, call \`update_post\` with the changes (no publish flip — use publish_post separately).
6. Re-run \`check_seo\` to confirm zero fails.
`

const REFRESH_COVER = (args: { post_id: string; style_hint?: string }) => `
Refresh the cover image for post ${args.post_id}.

1. Call \`get_post\` with id ${args.post_id}.
2. Read site://image-style.
3. Compose a new prompt for the cover, incorporating: ${args.style_hint ?? '(no style hint — use defaults)'}.
4. Call \`set_post_cover\` with the post id and either { generate: { prompt, alt } } or an existing { mediaId } — this generates and attaches in one shot.
5. Share the resulting post page URL (/thoughts/{slug}) with the user.
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerPrompts(server: any) {
  server.registerPrompt(
    'write_blog_post',
    {
      title: 'Write a blog post end-to-end',
      description: 'Guided workflow: plan → draft → image prompts → one-call author_blog_post → preview → publish.',
      argsSchema: {
        topic: z.string().describe('What the post is about'),
        angle: z.string().optional().describe('Specific angle / thesis'),
        target_length: z.string().optional().describe('e.g. "800 words"'),
      },
    },
    async (args: { topic: string; angle?: string; target_length?: string }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: WRITE_BLOG_POST(args) } }],
    }),
  )

  server.registerPrompt(
    'optimize_seo',
    {
      title: 'Audit and fix SEO on an existing post',
      description: 'Read post → check_seo → propose diff → user approval → update_post → recheck.',
      argsSchema: {
        post_id: z.string().describe('Id of post to optimize'),
      },
    },
    async (args: { post_id: string }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: OPTIMIZE_SEO(args) } }],
    }),
  )

  server.registerPrompt(
    'refresh_cover_image',
    {
      title: 'Regenerate the cover image for a post',
      description: 'Generate a new cover via Nano Banana and attach it to an existing post.',
      argsSchema: {
        post_id: z.string(),
        style_hint: z.string().optional(),
      },
    },
    async (args: { post_id: string; style_hint?: string }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: REFRESH_COVER(args) } }],
    }),
  )
}
