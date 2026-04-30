/**
 * Build a Microlink screenshot URL for a given site.
 * The `embed=screenshot.url` query makes the API redirect straight to the
 * rendered image, so the result can be passed to <Image src={...}> directly.
 *
 * Free tier: 50 unique screenshots/day — Next.js caches at the edge, so each
 * unique work URL only counts once until the cache expires.
 */
export function microlinkScreenshot(
  targetUrl: string,
  opts: { width?: number; height?: number; deviceScaleFactor?: number } = {},
) {
  const { width = 1280, height = 960, deviceScaleFactor = 2 } = opts
  const params = new URLSearchParams({
    url: targetUrl,
    screenshot: 'true',
    meta: 'false',
    embed: 'screenshot.url',
    'viewport.width': String(width),
    'viewport.height': String(height),
    'viewport.deviceScaleFactor': String(deviceScaleFactor),
  })
  return `https://api.microlink.io/?${params.toString()}`
}
