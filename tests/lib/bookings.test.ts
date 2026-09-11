import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-bookings.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('booking flow', () => {
  it('creates a booking for an available slot', async () => {
    const { createService } = await import('../../lib/services')
    const { createBooking } = await import('../../lib/bookings')
    const service = createService({
      name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
    })
    const result = createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: '2026-09-15', time: '10:00',
    })
    expect(result.ok).toBe(true)
  })

  it('rejects a booking for an already-taken slot', async () => {
    const { createService } = await import('../../lib/services')
    const { createBooking } = await import('../../lib/bookings')
    const service = createService({
      name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
    })
    const first = createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: '2026-09-15', time: '10:00',
    })
    expect(first.ok).toBe(true)

    const second = createBooking({
      serviceId: service.id, clientName: 'Sam Smith', clientEmail: 'sam@example.com',
      clientPhone: '07111111111', date: '2026-09-15', time: '10:00',
    })
    expect(second.ok).toBe(false)
    if (!second.ok) expect(second.error).toBe('slot_unavailable')
  })
})
