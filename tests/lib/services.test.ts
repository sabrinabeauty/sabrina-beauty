import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-services.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('services data layer', () => {
  it('creates a service and lists it', async () => {
    const { createService, listServices } = await import('../../lib/services')
    createService({
      name: 'Brow Shape',
      category: 'brow',
      description: 'Precision waxing.',
      pricePence: 1800,
      durationMinutes: 15,
      active: true,
    })
    const services = listServices()
    expect(services).toHaveLength(1)
    expect(services[0].name).toBe('Brow Shape')
  })

  it('deactivateService hides it from activeOnly listing but keeps it in full listing', async () => {
    const { createService, deactivateService, listServices } = await import('../../lib/services')
    const s = createService({
      name: 'Back Exfoliation',
      category: 'facial',
      description: 'Deep cleansing back treatment.',
      pricePence: 4500,
      durationMinutes: 35,
      active: true,
    })
    deactivateService(s.id)
    expect(listServices({ activeOnly: true })).toHaveLength(0)
    expect(listServices({ activeOnly: false })).toHaveLength(1)
  })
})
