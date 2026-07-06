# SEO Rules

These rules mirror what `check_seo` enforces. Pass them all before publishing.

## Meta title
- 30–60 characters (warn outside, fail >70)
- Front-load the keyword
- Distinct from H1 — meta title can be more search-y, H1 can be more human

## Meta description
- 70–160 characters (fail >160)
- Should make someone want to click
- Include the keyword once, naturally

## Slug
- Lowercase kebab-case, ≤60 chars
- No stop words unless they meaningfully change meaning
- Stable forever — never rename a published slug

## Body structure
- At least one H2
- H2s read like a table of contents
- Inline images: every image has descriptive alt text (no empty alts)

## Cover image
- Always set unless the post is intentionally minimal
- Used as default OG / Twitter card image

## Tags
- 2–4 tags, ideally from existing tags (resource: site://existing-tags)
- New tags only when no existing tag fits — justify briefly
