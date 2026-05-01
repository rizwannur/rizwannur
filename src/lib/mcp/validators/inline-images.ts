const PLACEHOLDER_RE = /!\[[^\]]*\]\((IMG_\d+)\)/g

export type InlineImagesMap = Record<string, number>

export type InlineValidationResult =
  | { ok: true; placeholders: string[] }
  | {
      ok: false
      missingFromMap: string[]
      unusedInMap: string[]
      duplicates: string[]
    }

export function validateInlineImages(
  body: string,
  map: InlineImagesMap | undefined,
): InlineValidationResult {
  const found = new Set<string>()
  const duplicates: string[] = []
  const matches = body.matchAll(PLACEHOLDER_RE)
  for (const m of matches) {
    const key = m[1]
    if (found.has(key)) duplicates.push(key)
    found.add(key)
  }

  const placeholders = [...found]
  const provided = new Set(Object.keys(map ?? {}))
  const missingFromMap = placeholders.filter((p) => !provided.has(p))
  const unusedInMap = [...provided].filter((p) => !found.has(p))

  if (missingFromMap.length === 0 && unusedInMap.length === 0 && duplicates.length === 0) {
    return { ok: true, placeholders }
  }
  return { ok: false, missingFromMap, unusedInMap, duplicates }
}

export function formatInlineValidationError(r: Extract<InlineValidationResult, { ok: false }>): string {
  const parts: string[] = []
  if (r.missingFromMap.length) {
    parts.push(
      `Body references inline images that are not in inlineImages: ${r.missingFromMap.join(', ')}. ` +
        `Call generate_image for each, then include them in the inlineImages map.`,
    )
  }
  if (r.unusedInMap.length) {
    parts.push(
      `inlineImages contains keys not referenced in body: ${r.unusedInMap.join(', ')}. ` +
        `Either reference them via ![alt](IMG_N) or remove them.`,
    )
  }
  if (r.duplicates.length) {
    parts.push(`Duplicate placeholder references in body: ${r.duplicates.join(', ')}. Each IMG_N should appear once.`)
  }
  return parts.join(' ')
}
