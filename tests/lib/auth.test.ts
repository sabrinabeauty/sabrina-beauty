import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-auth.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('auth', () => {
  it('verifyPassword returns false when no password has been set yet', async () => {
    const { verifyPassword } = await import('../../lib/auth')
    expect(await verifyPassword('anything')).toBe(false)
  })

  it('hashPassword + setAdminPasswordHash round-trips through verifyPassword', async () => {
    const { hashPassword, verifyPassword } = await import('../../lib/auth')
    const { setAdminPasswordHash } = await import('../../lib/settings')
    setAdminPasswordHash(await hashPassword('correct-horse'))
    expect(await verifyPassword('correct-horse')).toBe(true)
    expect(await verifyPassword('wrong')).toBe(false)
  })

  it('createSessionToken produces a token verifySessionToken accepts, and rejects a tampered token', async () => {
    const { createSessionToken, verifySessionToken } = await import('../../lib/auth')
    const token = await createSessionToken()
    expect(await verifySessionToken(token)).toBe(true)
    expect(await verifySessionToken(token + 'x')).toBe(false)
    expect(await verifySessionToken(undefined)).toBe(false)
  })
})
