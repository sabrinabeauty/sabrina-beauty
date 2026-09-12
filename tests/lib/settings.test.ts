import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-settings.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('settings', () => {
  it('getHomepageVariant defaults to "new" when unset', async () => {
    const { getHomepageVariant } = await import('../../lib/settings')
    expect(getHomepageVariant()).toBe('new')
  })

  it('setHomepageVariant persists and getHomepageVariant reflects it', async () => {
    const { getHomepageVariant, setHomepageVariant } = await import('../../lib/settings')
    setHomepageVariant('original')
    expect(getHomepageVariant()).toBe('original')
    setHomepageVariant('new')
    expect(getHomepageVariant()).toBe('new')
  })

  it('getAdminPasswordHash returns undefined when never set', async () => {
    const { getAdminPasswordHash } = await import('../../lib/settings')
    expect(getAdminPasswordHash()).toBeUndefined()
  })

  it('setAdminPasswordHash persists and getAdminPasswordHash reflects it', async () => {
    const { getAdminPasswordHash, setAdminPasswordHash } = await import('../../lib/settings')
    setAdminPasswordHash('some-bcrypt-hash')
    expect(getAdminPasswordHash()).toBe('some-bcrypt-hash')
  })
})
