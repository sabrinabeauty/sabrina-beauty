import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Load .env.local into process.env so tests can reach the real (dev-branch) Postgres
// database and Blob store, the same way `next dev` and the seed scripts do.
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

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // All test files share one real Postgres database and TRUNCATE it in
    // beforeEach — running files in parallel would let them stomp on each other.
    fileParallelism: false,
  },
})
