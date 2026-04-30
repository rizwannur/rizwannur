const regionDisplay = new Intl.DisplayNames(['en'], { type: 'region' })

export function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return ''
  const upper = code.toUpperCase()
  if (!/^[A-Z]{2}$/.test(upper)) return ''
  const A = 0x1f1e6
  return String.fromCodePoint(
    A + upper.charCodeAt(0) - 65,
    A + upper.charCodeAt(1) - 65,
  )
}

export function countryName(code: string): string {
  if (!code || code === 'unknown') return 'Unknown'
  try {
    return regionDisplay.of(code.toUpperCase()) ?? code.toUpperCase()
  } catch {
    return code.toUpperCase()
  }
}

export function countryLabel(code: string): string {
  const flag = flagEmoji(code)
  const name = countryName(code)
  return flag ? `${flag} ${name}` : name
}
