import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-admin-services.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('admin service management reflects on public listing', () => {
  it('deactivating a service removes it from the active-only public listing', async () => {
    const { createService, deactivateService, listServices } = await import('../../lib/services')
    const s = createService({
      name: 'Dermaplaning Glow Facial', category: 'facial', description: 'x',
      pricePence: 9000, durationMinutes: 60, active: true,
    })
    expect(listServices({ activeOnly: true }).map((x) => x.id)).toContain(s.id)
    deactivateService(s.id)
    expect(listServices({ activeOnly: true }).map((x) => x.id)).not.toContain(s.id)
  })
})
