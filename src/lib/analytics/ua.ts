import { UAParser } from 'ua-parser-js'

export type Device = 'desktop' | 'mobile' | 'tablet' | 'bot'

export function parseUA(userAgent: string): {
  device: Device
  browser: string
  os: string
} {
  const parsed = new UAParser(userAgent).getResult()
  const rawDevice = parsed.device.type
  const device: Device =
    rawDevice === 'mobile' ? 'mobile' : rawDevice === 'tablet' ? 'tablet' : 'desktop'
  return {
    device,
    browser: (parsed.browser.name ?? '').toLowerCase(),
    os: (parsed.os.name ?? '').toLowerCase(),
  }
}
