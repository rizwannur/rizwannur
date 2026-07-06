import { createHash } from 'crypto'

export function hashIp(ip: string): string {
  const salt = process.env.PAYLOAD_IP_SALT
  if (!salt || salt.length < 32) {
    throw new Error('PAYLOAD_IP_SALT must be set to a string of at least 32 characters')
  }
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex')
}
