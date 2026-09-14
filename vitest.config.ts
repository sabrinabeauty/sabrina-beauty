import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Load .env.local into process.env so tests can reach Postgres and Blob the same
// way `next dev` and the seed scripts do.
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    const value = rawValue.replace(/^"(.*)"$/, '$1')
    if (!(key in process.env)) process.env[key] = value
  }
}

// IMPORTANT: point at the dedicated sabrina-beauty-test-db, never the real
// dev/preview/production database — tests TRUNCATE every table in beforeEach, and
// running that against shared data once already wiped the real seeded services,
// FAQs, and admin password during this project's setup. TEST_POSTGRES_URL comes
// from the separate Neon database connected (Development-only) with a "TEST"
// custom env var prefix specifically so `@vercel/postgres`'s default `sql` export
// (which always reads POSTGRES_URL) can be redirected here.
if (process.env.TEST_POSTGRES_URL) {
  process.env.POSTGRES_URL = process.env.TEST_POSTGRES_URL
} else {
  throw new Error(
    'TEST_POSTGRES_URL is not set — refusing to run tests, since without it they would ' +
      'fall back to POSTGRES_URL and TRUNCATE the real database. Run `vercel env pull .env.local` again.'
  )
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // All test files share one real Postgres database and TRUNCATE it in
    // beforeEach — running files in parallel would let them stomp on each other.
    fileParallelism: false,
  },
})
