import 'dotenv/config'
import { checkSeo } from '@/lib/mcp/validators/seo'
import { suggestInternalLinks } from '@/lib/mcp/internal-links'

let pass = 0
let fail = 0

console.log('— SEO validator (DB-backed) —')
try {
  const r = await checkSeo({
    title: 'Hi',
    excerpt: 'Short',
    body: '## Section\n\nBody',
    tags: ['a'],
  })
  const failRules = r.issues.filter((i) => i.level === 'fail').map((i) => i.rule)
  console.log(`  fail rules: ${failRules.join(', ') || '(none)'}`)
  console.log(`  warn count: ${r.issues.filter((i) => i.level === 'warn').length}`)
  console.log(`  passed: ${r.passed.join(', ')}`)
  if (r.issues.some((i) => i.rule === 'meta_title_length' && i.level === 'warn')) {
    pass += 1
    console.log('  PASS  short title flagged')
  } else {
    fail += 1
    console.log('  FAIL  short title not flagged')
  }
  if (r.issues.some((i) => i.rule === 'meta_description_length' && i.level === 'warn')) {
    pass += 1
    console.log('  PASS  short description flagged')
  } else {
    fail += 1
    console.log('  FAIL  short description not flagged')
  }
} catch (e) {
  fail += 1
  console.log(`  FAIL  threw: ${(e as Error).message}`)
}

console.log('— internal links —')
try {
  const r = await suggestInternalLinks({ body: 'caching performance nextjs revalidation' })
  console.log(`  suggestions: ${r.length}`)
  pass += 1
} catch (e) {
  fail += 1
  console.log(`  FAIL  threw: ${(e as Error).message}`)
}

console.log(`\nTotal: ${pass} pass, ${fail} fail`)
if (fail > 0) process.exit(1)
process.exit(0)
