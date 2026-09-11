// tests/api/booking-flow.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-booking-flow.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('end-to-end booking flow', () => {
  it('lists services, finds an available slot, books it, and the slot disappears from availability', async () => {
    const { createService } = await import('../../lib/services')
    const { getAvailableSlots, createBooking } = await import('../../lib/bookings')

    const service = createService({
      name: 'Classic Cleanse & Glow Facial', category: 'facial', description: 'x',
      pricePence: 7500, durationMinutes: 60, active: true,
    })

    const tuesday = '2026-09-15' // confirmed Tuesday
    const slotsBefore = getAvailableSlots(service.id, tuesday)
    expect(slotsBefore.length).toBeGreaterThan(0)

    const chosen = slotsBefore[0]
    const result = createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: tuesday, time: chosen,
    })
    expect(result.ok).toBe(true)

    const slotsAfter = getAvailableSlots(service.id, tuesday)
    expect(slotsAfter).not.toContain(chosen)
  })
})
