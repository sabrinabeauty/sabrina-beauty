import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

beforeEach(() => {
  process.env.SESSION_SECRET = 'test-secret'
})

describe('auth', () => {
  it('verifyPassword returns true for the correct password', async () => {
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-horse', 10)
    const { verifyPassword } = await import('../../lib/auth')
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
