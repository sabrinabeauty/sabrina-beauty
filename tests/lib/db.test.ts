import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('getDb', () => {
  it('creates the services, bookings, and blocked_slots tables', async () => {
    const { getDb } = await import('../../lib/db')
    const db = getDb()
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name)
    expect(tables).toEqual(expect.arrayContaining(['services', 'bookings', 'blocked_slots']))
  })
})
