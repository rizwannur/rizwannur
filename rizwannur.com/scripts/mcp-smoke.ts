import 'dotenv/config'
import { validateInlineImages, formatInlineValidationError } from '@/lib/mcp/validators/inline-images'

let pass = 0
let fail = 0

function eq(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    pass += 1
    console.log(`  PASS  ${name}`)
  } else {
    fail += 1
    console.log(`  FAIL  ${name}\n         expected: ${e}\n         actual:   ${a}`)
  }
}

console.log('— inline-images validator —')
{
  const r = validateInlineImages('Hello ![cat](IMG_1) world ![dog](IMG_2)', { IMG_1: 1, IMG_2: 2 })
  eq('all matched', r, { ok: true, placeholders: ['IMG_1', 'IMG_2'] })
}
{
  const r = validateInlineImages('Body ![cat](IMG_1)', {})
  eq('missing from map', r, { ok: false, missingFromMap: ['IMG_1'], unusedInMap: [], duplicates: [] })
}
{
  const r = validateInlineImages('No images', { IMG_1: 1 })
  eq('unused in map', r, { ok: false, missingFromMap: [], unusedInMap: ['IMG_1'], duplicates: [] })
}
{
  const r = validateInlineImages('![a](IMG_1) ![b](IMG_1)', { IMG_1: 1 })
  if (r.ok) {
    fail += 1
    console.log('  FAIL  duplicate detection (got ok=true)')
  } else {
    eq('duplicate keys', r.duplicates, ['IMG_1'])
  }
}
{
  const r = validateInlineImages('Plain post no images', undefined)
  eq('no map, no placeholders', r, { ok: true, placeholders: [] })
}
{
  const r = validateInlineImages('Body ![a](IMG_1) ![b](IMG_2)', { IMG_1: 1 })
  if (r.ok) {
    fail += 1
    console.log('  FAIL  partial map should fail')
  } else {
    eq('partial map', r.missingFromMap, ['IMG_2'])
  }
}
{
  const r = validateInlineImages('Body ![a](IMG_1)', { IMG_1: 1, IMG_2: 2 })
  if (r.ok) {
    fail += 1
    console.log('  FAIL  extra map keys should fail')
  } else {
    eq('extra map keys', r.unusedInMap, ['IMG_2'])
  }
}

console.log('— formatInlineValidationError —')
{
  const r = validateInlineImages('Body ![a](IMG_1)', {})
  if (!r.ok) {
    const msg = formatInlineValidationError(r)
    if (msg.includes('IMG_1')) {
      pass += 1
      console.log('  PASS  error message references missing key')
    } else {
      fail += 1
      console.log(`  FAIL  error message missing key — got: ${msg}`)
    }
  }
}

console.log(`\nTotal: ${pass} pass, ${fail} fail`)
if (fail > 0) process.exit(1)
