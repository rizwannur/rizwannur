export {}

const url = process.env.SMOKE_URL ?? 'http://localhost:3000/api/pv'

async function call(body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  return { status: res.status, text: await res.text() }
}

const human = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'x-forwarded-for': '203.0.113.10',
  'x-vercel-ip-country': 'US',
  'x-vercel-ip-city': 'San Francisco',
}

const okHuman = await call({ path: '/work', referrer: 'https://google.com' }, human)
console.log('human:', okHuman)
if (okHuman.status !== 204) throw new Error(`expected 204, got ${okHuman.status}`)

const bot = await call(
  { path: '/' },
  { 'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
)
console.log('bot:', bot)
if (bot.status !== 204) throw new Error(`bots should also return 204`)

const noPath = await call({}, human)
console.log('no path:', noPath)
if (noPath.status !== 400) throw new Error('expected 400 when path missing')

console.log('OK')
