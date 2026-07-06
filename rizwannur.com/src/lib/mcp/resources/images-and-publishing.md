# Images, Drafts, and Publishing — How the MCP wires into Payload

This is the **canonical** explanation of what happens when an MCP agent
edits content. Read this before authoring or editing.

## URL routing (the site has no `/blog`)

| Collection | Public path        | Notes                                         |
|------------|--------------------|-----------------------------------------------|
| `posts`    | `/thoughts/{slug}` | NOT `/blog`. Tools return both `path` + `url`.|
| `work`     | `/work/{slug}`     |                                               |
| `craft`    | `/craft/{slug}`    |                                               |

## Draft / publish state — fully native to Payload

Both `posts` and `work` use Payload's **versions + drafts** feature
(`versions: { drafts: { autosave } }` on the collection).

- `_status: 'draft'`     → invisible to the public, only authed admin
                            sees it via Live Preview / draft mode.
- `_status: 'published'` → public.
- Legacy items with no `_status` → treated as published (back-compat).

Access control on the collection enforces this — drafts are denied to
unauthed requests at the database query layer.

### MCP tools for status flips

| Goal                     | Tool                                |
|--------------------------|-------------------------------------|
| Create as draft          | `create_post` / `create_work` (default)
| Promote to public        | `publish_post(id)` / `publish_work(id)`
| Take public → draft      | `unpublish_post(id)` / `unpublish_work(id)`
| Edit fields, keep state  | `update_post` / `update_work`       |

`update_*` reads the doc's current `_status` and never silently changes
it. Only `publish_*` and `unpublish_*` flip state.

## Preview workflow

This uses the **standard Payload + Next.js draft-mode pattern**:

1. `posts` and `work` declare `admin.livePreview.url` on their
   collection config. The URL points at `/api/preview?...`.
2. `/api/preview` is a Next route handler that:
   - calls `payload.auth({ headers })` to verify a real Payload admin user;
   - returns 401 if the caller isn't authed;
   - calls Next's `draftMode().enable()` (sets a signed cookie);
   - redirects to the public path.
3. The detail pages (`/thoughts/[slug]`, `/work/[slug]`) call
   `draftMode().isEnabled` and pass `draft: true` + `overrideAccess: true`
   to `payload.find` only when it is. Without the cookie they stay
   statically generated and serve the published version.

`preview_post` and `preview_work` MCP tools return three URLs:

- `publicUrl`        — the live page; 404 for drafts to non-admins.
- `adminPreviewUrl`  — the route above, only useful when opened by an
                       admin in a browser with the Payload auth cookie.
- `adminEditUrl`     — deep link to the Payload admin editor.

## Image flow

There is exactly one canonical image store: the Payload `media`
collection (which uses Vercel Blob in prod via the storage plugin).
Everything below ends in a row in that table with `id`, `url`, `alt`,
`width`, `height`, `mimeType`, `filesize`.

### Three ways an image gets into media

| Source                         | MCP tool         | Pipeline                               |
|--------------------------------|------------------|----------------------------------------|
| AI-generated (Nano Banana)     | `generate_image` | Gemini 2.5 Flash Image → buffer → `payload.create({ collection: 'media', file })`
| Public URL the agent already has | `upload_media` | `fetch(url)` → buffer → `payload.create({ collection: 'media', file })`
| Manual upload by a human       | Payload admin    | Standard Payload upload field          |

In all three cases Payload's upload pipeline runs: filename
sanitization, MIME validation via Sharp, Vercel Blob upload, and
DB row insert. The MCP tools never bypass that — they hand Payload a
`file: { data, mimetype, name, size }` object and let it do the work.

### How images are attached to a post or work item

There are three attachment surfaces and one tool per surface:

| Surface                | Tool                                | Field on doc           |
|------------------------|-------------------------------------|------------------------|
| Cover (hero) image     | `set_post_cover` / `set_work_cover` | `coverImage` / `cover` |
| Inline body image      | `inlineImages` map on create/update | rich-text body         |
| Work gallery           | `set_work_images`                   | `images[]` array       |
| SEO og:image           | `set_*_cover` (auto) or `seo.image` | `meta.image`           |

`set_post_cover` / `set_work_cover` accept three input shapes:

```ts
{ mediaId: 42 }                                    // existing media
{ generate: { prompt, alt, aspectRatio } }         // generate + attach
{ clear: true }                                    // remove
```

When `updateMetaImage: true` (default) they also write the same id to
`meta.image` so social embeds match the visible cover.

`generate_image` has an optional `attach` parameter that does generate +
attach in one call:

```ts
generate_image({
  prompt, alt, purpose: 'cover',
  attach: { target: 'post' | 'work', id, field: 'cover' | 'meta' }
})
```

### Inline images in the body — the IMG_N convention

When the body needs an image inline, the agent writes a placeholder
in markdown:

```md
Some text...

![A diagram of the rendering pipeline](IMG_1)

More text. Another one: ![Final output](IMG_2)
```

Then the tool call provides an `inlineImages` map keyed by the same
`IMG_N`:

```ts
inlineImages: {
  IMG_1: 42,   // existing media id
  IMG_2: 87,
}
```

Server-side validation (`validateInlineImages`) checks both directions:

- every `IMG_N` in body has a matching key in the map;
- every key in the map appears in the body;
- no duplicates.

Mismatches return `error.code = inline_images_invalid` with details on
what's missing.

After validation the server resolves each id to the media URL, replaces
`![alt](IMG_N)` → `![alt](https://blob-url/...)`, then runs the standard
markdown → Lexical conversion. The resulting Lexical tree contains
inline image nodes. They render fine in the rich-text component.

(Note: human admin uploads via the editor produce **upload** nodes
which reference media by id rather than URL. The visual output is the
same; the AST shape differs. This is the one place where AI-authored
and admin-authored bodies are not byte-identical.)

## SEO meta — Payload SEO plugin

The SEO plugin adds a `meta` group to `posts` and `work`:

- `meta.title`        — overrides the `<title>` tag
- `meta.description`  — overrides `<meta name="description">`
- `meta.image`        — overrides `og:image` and `twitter:image`

The detail pages call `buildPageMetadata(...)` which feeds these into
Next.js `Metadata`, with a fallback chain:

1. `meta.image`           → if set
2. `coverImage` / `cover` → cover image of the doc
3. microlink screenshot   → only for work items with `href`
4. `${siteUrl}/opengraph-image` → site-wide fallback

The MCP tools surface SEO via the `seo` field on `create_*` / `update_*`
and as part of `get_*` output.

## What the agent should do, end-to-end

1. Read `site://voice`, `site://image-style`, `site://seo-rules`.
2. Plan the post / work item, including image needs.
3. Either:
   - call `author_blog_post` (one-pass: validates, generates images,
     creates the post as a **draft**, returns previewUrl), or
   - call `generate_image` + `upload_media` as needed, then
     `create_post` / `create_work` as a draft.
4. Call `preview_post` / `preview_work`, share `adminPreviewUrl` with
   the human reviewer.
5. On approval, call `publish_post(id)` / `publish_work(id)`.

Never publish without explicit user approval.
