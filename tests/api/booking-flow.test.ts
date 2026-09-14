// tests/api/booking-flow.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createService } from '../../lib/services'
import { getAvailableSlots, createBooking } from '../../lib/bookings'

beforeEach(async () => {
  await resetDbForTests()
})

describe('end-to-end booking flow', () => {
  it('lists services, finds an available slot, books it, and the slot disappears from availability', async () => {
    const service = await createService({
      name: 'Classic Cleanse & Glow Facial', category: 'facial', description: 'x',
      pricePence: 7500, durationMinutes: 60, active: true,
    })

    const tuesday = '2026-09-15' // confirmed Tuesday
    const slotsBefore = await getAvailableSlots(service.id, tuesday)
    expect(slotsBefore.length).toBeGreaterThan(0)

    const chosen = slotsBefore[0]
    const result = await createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: tuesday, time: chosen,
    })
    expect(result.ok).toBe(true)

    const slotsAfter = await getAvailableSlots(service.id, tuesday)
    expect(slotsAfter).not.toContain(chosen)
  })
})
