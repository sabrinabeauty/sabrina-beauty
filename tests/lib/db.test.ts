import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests, sql } from '../../lib/db'

beforeEach(async () => {
  await resetDbForTests()
})

describe('ensureSchema', () => {
  it('creates the services, bookings, and blocked_slots tables', async () => {
    const { rows } = await sql<{ table_name: string }>`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    `
    const tables = rows.map((r) => r.table_name)
    expect(tables).toEqual(expect.arrayContaining(['services', 'bookings', 'blocked_slots']))
  })
})
