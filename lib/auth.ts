import bcrypt from 'bcryptjs'
import { getAdminPasswordHash } from './settings'

// Password logic — DB-backed, so this file must only ever be imported from Node.js
// API routes, never from middleware.ts (Edge runtime). Session token logic lives in
// lib/session.ts, which has no DB dependency and is safe for middleware to import.
export { SESSION_COOKIE_NAME, createSessionToken, verifySessionToken } from './session'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string): Promise<boolean> {
  const hash = getAdminPasswordHash()
  if (!hash) return false
  return bcrypt.compare(plain, hash)
}
