import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'

export const SESSION_COOKIE_NAME = 'sabrina_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

export async function verifyPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) return false
  return bcrypt.compare(plain, hash)
}

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET || ''
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function createSessionToken(): string {
  const expiry = Date.now() + SESSION_TTL_MS
  const payload = String(expiry)
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  if (sign(payload) !== signature) return false
  const expiry = Number(payload)
  if (Number.isNaN(expiry) || Date.now() > expiry) return false
  return true
}
