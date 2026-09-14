import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createService } from '../../lib/services'
import { createBooking, deleteBooking, listBookings } from '../../lib/bookings'

beforeEach(async () => {
  await resetDbForTests()
})

describe('booking flow', () => {
  it('creates a booking for an available slot', async () => {
    const service = await createService({
      name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
    })
    const result = await createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: '2026-09-15', time: '10:00',
    })
    expect(result.ok).toBe(true)
  })

  it('rejects a booking for an already-taken slot', async () => {
    const service = await createService({
      name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
    })
    const first = await createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: '2026-09-15', time: '10:00',
    })
    expect(first.ok).toBe(true)

    const second = await createBooking({
      serviceId: service.id, clientName: 'Sam Smith', clientEmail: 'sam@example.com',
      clientPhone: '07111111111', date: '2026-09-15', time: '10:00',
    })
    expect(second.ok).toBe(false)
    if (!second.ok) expect(second.error).toBe('slot_unavailable')
  })

  it('deleteBooking removes it and frees the slot for rebooking', async () => {
    const service = await createService({
      name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
    })
    const first = await createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: '2026-09-15', time: '10:00',
    })
    expect(first.ok).toBe(true)
    if (!first.ok) return

    await deleteBooking(first.booking.id)
    expect(await listBookings()).toHaveLength(0)

    const second = await createBooking({
      serviceId: service.id, clientName: 'Sam Smith', clientEmail: 'sam@example.com',
      clientPhone: '07111111111', date: '2026-09-15', time: '10:00',
    })
    expect(second.ok).toBe(true)
  })
})
