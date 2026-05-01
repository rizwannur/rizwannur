# MCP Guided-Flow Overhaul + Content Rendering + 404 Page

**Status:** Draft
**Date:** 2026-05-02
**Author:** Rafey + Claude

## Goals

1. Make AI agents reliably author full blog posts (text + cover + inline images + SEO) end-to-end through the MCP server, with structured guidance, validation, and explicit recovery paths.
2. Render content fields that already exist in the CMS but currently never reach the page (`coverImage`, `tags` on Posts).
3. Replace Next.js's default 404 with a branded, helpful page consistent with the site aesthetic.

## Non-Goals

- Redesigning the public site visual language.
- Adding new collections.
- Changing existing Work / Craft rendering (already complete).
- Building a queueing / job system for image generation. Calls are synchronous; per-image latency is acceptable.

---

## Part 1 — Render Dead Fields on Posts

`Posts.coverImage` and `Posts.tags` are defined in `src/collections/Posts.ts` but never displayed. Two pages need updates.

### `src/app/(frontend)/thoughts/page.tsx` (index)

- Change Payload query `depth: 0` → `depth: 1` so `coverImage` resolves to a `Media` doc.
- Map `coverImage.url` and `tags` into the `Thought` type passed to `ThoughtRow`.
- Update `Thought` type in `src/lib/types/thoughts.ts` to include `coverImage?: { url: string; alt: string }` and `tags?: string[]`.
- Update `ThoughtRow` component to render: thumbnail image (left or top, see component), tag chips beneath excerpt.

### `src/app/(frontend)/thoughts/[slug]/page.tsx` (detail)

- Already uses `depth: 1`, just consume the data.
- Render cover image as a hero block above `<article>` body, using `next/image`. Aspect ratio 16:9, full content width, rounded corners matching existing design tokens.
- Render `tags` as a chip row under the date/readTime line.

### Visual treatment

- Reuse existing fonts, color tokens, spacing scale. No new components if a near-equivalent exists; check `src/components/ui/` first.
- Tag chips: small, neutral background, rounded-full, identical to any existing chip style if present (else minimal: `text-xs px-2 py-0.5 rounded-full border`).
- Cover image: `next/image` with `fill` + `sizes` attribute, `priority` only on detail page hero.

---

## Part 2 — Branded 404 Page

New file: `src/app/(frontend)/not-found.tsx`

### Content

- Headline ("Page not found" or playful equivalent — keep tone consistent with site copy).
- One short helpful sentence.
- Search input (reuses `SearchInput` component) that submits to `/thoughts?q=…`.
- Recent Thoughts list: top 5 published posts (title + date), fetched via Payload server-side.
- "Back to home" link.

### Layout

- Wrap in `PageShell`.
- Use existing typography utilities (`font-display`, etc.).
- Footer included.

### Behavior

- Server component (no client JS unless `SearchInput` already requires it).
- `revalidate = 300` to keep recent-posts list fresh without rebuilding on every miss.

---

## Part 3 — MCP Guided Authoring Flow

### Architectural shape

The MCP server gains three new primitives layered on top of existing tools:

1. **Tools (capabilities)** — atomic, idempotent, validated. Existing tools stay; new ones added; two existing tools (`create_post`, `update_post`) extended.
2. **Prompts (workflows)** — slash-prompt templates the agent invokes to receive a structured plan. Prompts are *instructions to the agent*, not server-side orchestration.
3. **Resources (context)** — URI-addressable read-only documents the agent attaches to its context (site voice, SEO rules, image style, recent posts, existing tags).

This split matches the MCP spec and keeps each concern testable in isolation.

### New tools

#### `generate_image`

Generates a cover or inline body image using Google's Gemini `gemini-2.5-flash-image` (Nano Banana) and uploads the result to the `media` collection.

- **Input:**
  - `prompt: string` — descriptive prompt; agent should incorporate site style guide (resource).
  - `purpose: 'cover' | 'inline'` — controls aspect ratio default and alt-text framing.
  - `alt: string` — required, used for accessibility and stored on the Media doc.
  - `aspectRatio?: '16:9' | '4:3' | '1:1' | '3:4'` — default `16:9` for cover, `4:3` for inline.
  - `filename?: string` — optional, auto-generated otherwise.
- **Behavior:**
  1. Call `@google/genai` `generateContent` with `gemini-2.5-flash-image`, passing prompt + a system instruction injecting the `site://image-style` resource summary.
  2. Extract first image part from response, decode base64 → Buffer.
  3. Upload to Payload `media` collection via `payload.create({ collection: 'media', file: { data, mimetype, name, size } })`.
  4. Return `{ mediaId, url, alt, prompt }`.
- **Errors:**
  - Missing `GEMINI_API_KEY` → clear error directing to env setup.
  - Safety block from API → return reason verbatim so agent can adjust prompt.
  - Upload failure → return error with remediation.
- **Cost note in tool description:** "Each call costs ~$0.04. Use `purpose: 'inline'` sparingly — typically 0–2 inline images per post."

#### `check_seo`

Validates SEO fields against site rules.

- **Input:** `{ title, excerpt, slug, metaTitle?, metaDescription?, coverImageId?, tags?, body }`
- **Returns:** structured report — pass/warn/fail per rule, with the rule that fired and suggested fix.
- **Rules enforced:**
  - Meta title 30–60 chars (warn outside, fail >70).
  - Meta description 70–160 chars.
  - Slug lowercase, kebab-case, ≤ 60 chars, no slug collision (queries Payload).
  - At least one H2 in body.
  - Cover image present (warn if missing).
  - All inline images have non-empty alt text.
  - Tag count 1–5; each tag exists in `site://existing-tags` OR is intentionally new (agent decides).
- Pure function — does not mutate. Agent calls before publish.

#### `suggest_internal_links`

Given a draft body, returns up to 5 existing posts whose titles/excerpts overlap the draft topic.

- **Input:** `{ body: string, excludeSlug?: string, limit?: number }`
- **Returns:** `[{ slug, title, snippet, suggestedAnchorText }]`
- **Behavior:** simple keyword overlap scoring on title + excerpt + tags from existing published posts. No embeddings. Cheap and deterministic.

#### `preview_post`

Returns a server-rendered preview URL for a draft.

- **Input:** `{ id: string }`
- **Returns:** `{ previewUrl: string }` — uses Payload's draft preview mechanism with a signed token.
- Agent shares this URL with Rafey before publish.

### Modified existing tools

#### `create_post` — extended input

- Add `inlineImages?: Record<string, number>` — placeholder-name → media id map. Example: `{ "IMG_1": 42, "IMG_2": 43 }`.
- Body markdown may contain `![alt](IMG_1)` style references.
- **Server validation:**
  - Parse body, find every `IMG_N` reference.
  - For each: must have key in `inlineImages`. If not → error listing missing keys.
  - For each `inlineImages` key: media id must exist. If not → error listing invalid ids.
  - Substitute references with actual media URLs / Lexical UploadNodes during `markdownToLexical`.
- **Errors are explicit and structured** so the agent self-corrects in one retry:
  ```
  ValidationError: Body references inline images that are not provided:
    - IMG_2 (referenced on line 14)
  Either remove the reference or call generate_image and include it in inlineImages.
  ```

#### `update_post` — same extension

Same `inlineImages` handling. Pass-through if no body update.

#### Tool description rewrites

All tool descriptions updated to **explicitly chain** to the next expected tool. Example:

> `create_post`: Creates a published or draft post. **Before calling this, you should:** (1) generate a cover via `generate_image` (purpose: 'cover'), (2) generate any inline images referenced as `![alt](IMG_N)` in body, (3) run `check_seo` on the inputs. After this call, share the returned `previewUrl` (call `preview_post`) with the user before any further changes.

Every tool gets a **"Next steps"** section in its description.

### Prompts

Three slash-prompts agents can invoke. These are markdown templates returned by the MCP server.

#### `write_blog_post`

- **Args:** `topic`, `angle?`, `target_length?`
- **Returned prompt structure:**
  1. Read resources `site://voice`, `site://seo-rules`, `site://image-style`, `site://existing-tags`, `site://recent-posts`.
  2. Write outline (4–7 sections, mark which sections benefit from an inline image).
  3. Draft body in markdown using site voice. Use `![alt](IMG_N)` placeholders where images go.
  4. For each `IMG_N` in body: call `generate_image` with `purpose: 'inline'`. Collect ids.
  5. Call `generate_image` once with `purpose: 'cover'` and a prompt summarizing the post hook.
  6. Run `suggest_internal_links` against the draft. Edit body to weave in 1–3 links naturally.
  7. Compose `meta.title` and `meta.description`. Pick 2–4 tags from `site://existing-tags` (or justify a new one).
  8. Run `check_seo`. Fix every fail. Aim for zero warns.
  9. Call `create_post` with `status: 'draft'`, including `inlineImages` map.
  10. Call `preview_post`, share URL with user. Wait for approval before flipping to `published`.

#### `optimize_seo`

- **Arg:** `post_id`
- Audit post via `check_seo`, propose changes, apply via `update_post` only after summarizing diff for user.

#### `refresh_cover_image`

- **Args:** `post_id`, `style_hint?`
- Read existing post, call `generate_image` with refreshed prompt, update via `update_post`.

### Resources

URI scheme: `site://<name>`. All return markdown.

- `site://voice` — tone of voice guide. Hand-written by Rafey, stored in `src/lib/mcp/resources/voice.md`.
- `site://seo-rules` — SEO ruleset (mirrors `check_seo`'s rules but in prose for the agent to internalize).
- `site://image-style` — visual direction for Nano Banana prompts (mood, palette, framing, things to avoid). Hand-written.
- `site://existing-tags` — dynamically generated. Lists all distinct tags currently on published posts, sorted by frequency.
- `site://recent-posts` — dynamically generated. Last 20 published posts, title + slug + date + excerpt.

Implementation: `server.registerResource(...)` for each. Static ones read from disk; dynamic ones run a Payload query at read time.

### File structure

```
src/lib/mcp/
  tools.ts                 # existing, gets extended
  resources.ts             # NEW — all resource handlers
  prompts.ts               # NEW — all prompt handlers
  imagegen.ts              # NEW — Nano Banana wrapper
  resources/
    voice.md               # NEW — hand-written
    seo-rules.md           # NEW — hand-written
    image-style.md         # NEW — hand-written
  validators/
    inline-images.ts       # NEW — placeholder validator
    seo.ts                 # NEW — pure SEO rules
  lexical.ts               # extended to substitute IMG_N refs
src/app/mcp/route.ts       # registers prompts + resources alongside tools
```

### Env vars

- `GEMINI_API_KEY` — required for image generation. Tool fails gracefully with clear setup instructions if missing.

### Error handling philosophy

Every tool returns errors in a consistent envelope: `{ error: { code, message, remediation } }`. `remediation` is the next tool to call or the input fix to make. This single convention is what makes the chain robust — agents recover by reading `remediation`.

---

## Testing

- **Unit:** validators (`inline-images`, `seo`) — pure functions, plenty of cases.
- **Integration:** spin up Payload in test mode, call each tool end-to-end against a real DB. Verify `create_post` with `inlineImages` produces a valid Lexical doc with UploadNodes.
- **Manual:** end-to-end agent run using the `write_blog_post` prompt against a dev environment, with a stub Gemini client returning a fixed image.

---

## Risks & Tradeoffs

- **Gemini API latency** — image gen can take 5–15s. Tool description warns; agent should not parallelize >2 calls.
- **Cost** — ~$0.04 per image. The prompt explicitly tells the agent to budget 0–2 inline images per post.
- **Prompt drift** — if site voice evolves, the markdown resources are the single source of truth; updating them propagates to every future agent run.
- **Placeholder collisions** — agent could write `![alt](IMG_1)` literally without intending it as a placeholder. Validator treats anything matching `^IMG_\d+$` in image URL position as a placeholder; documented clearly in tool description.

---

## Out of Scope (Future)

- Streaming/progress for long image gen.
- Image editing (Nano Banana supports this; could add `edit_image` later for "darken cover", "add grain").
- Auto-generated alt text via vision model.
- Embedding-based internal link suggestion.
