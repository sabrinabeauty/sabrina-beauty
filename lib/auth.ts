import bcrypt from 'bcryptjs'

export const SESSION_COOKIE_NAME = 'sabrina_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

export async function verifyPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) return false
  return bcrypt.compare(plain, hash)
}

// Uses the Web Crypto API (globalThis.crypto.subtle) rather than node:crypto so this
// module works in both the Node.js runtime and Next.js's Edge middleware runtime.
async function sign(payload: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || ''
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSessionToken(): Promise<string> {
  const expiry = Date.now() + SESSION_TTL_MS
  const payload = String(expiry)
  return `${payload}.${await sign(payload)}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  if ((await sign(payload)) !== signature) return false
  const expiry = Number(payload)
  if (Number.isNaN(expiry) || Date.now() > expiry) return false
  return true
}
