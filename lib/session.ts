// Session token creation/verification only — deliberately has NO dependency on
// lib/db.ts (or anything that imports it). middleware.ts runs on Next.js's Edge
// runtime, which can't load native modules like better-sqlite3; even an unused
// top-level import would pull the whole DB module graph into the Edge bundle and
// break the build. Password logic (which needs the database) lives in lib/auth.ts
// and is only ever used from Node.js API routes, never from middleware.

export const SESSION_COOKIE_NAME = 'sabrina_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

// Must come from an env var, not generated in-memory: middleware.ts (Edge runtime)
// and the API routes (Node.js runtime) are separate JS isolates that do NOT share
// module-level variables, so each would generate its own random secret and every
// token would fail cross-runtime verification. A plain random hex string has no
// special characters, so — unlike the old bcrypt-hash-in-env approach — there's no
// escaping footgun; see README for the one-line setup command.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set. Run: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))" and put the output in .env.local as SESSION_SECRET=...'
    )
  }
  return secret
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
