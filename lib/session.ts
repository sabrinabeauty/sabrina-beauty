// Session token creation/verification only — deliberately has NO dependency on
// lib/db.ts (or anything that imports it). middleware.ts runs on Next.js's Edge
// runtime, which can't load native modules like better-sqlite3; even an unused
// top-level import would pull the whole DB module graph into the Edge bundle and
// break the build. Password logic (which needs the database) lives in lib/auth.ts
// and is only ever used from Node.js API routes, never from middleware.

export const SESSION_COOKIE_NAME = 'sabrina_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

// Not backed by the database, for the same Edge-runtime reason as above. Falls back
// to an in-memory value generated once per server process if SESSION_SECRET isn't
// set — fine for a single-operator admin panel (existing sessions just expire on
// restart).
let inMemorySessionSecret: string | null = null

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  if (!inMemorySessionSecret) {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    inMemorySessionSecret = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  return inMemorySessionSecret
}

// Uses the Web Crypto API (globalThis.crypto.subtle) rather than node:crypto so this
// module works in both the Node.js runtime and Next.js's Edge middleware runtime.
async function sign(payload: string): Promise<string> {
  const secret = getSessionSecret()
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
