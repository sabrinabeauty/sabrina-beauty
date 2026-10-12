import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createService } from '../../lib/services'
import { createBooking, deleteBooking, listBookings, listBookingsForDate, updateBookingStatus } from '../../lib/bookings'

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

  describe('listBookingsForDate', () => {
    it('returns only bookings for the given date, ordered by time', async () => {
      const service = await createService({
        name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
      })
      await createBooking({
        serviceId: service.id, clientName: 'Later Today', clientEmail: 'a@example.com',
        clientPhone: '07000000000', date: '2026-09-15', time: '14:00',
      })
      await createBooking({
        serviceId: service.id, clientName: 'Earlier Today', clientEmail: 'b@example.com',
        clientPhone: '07000000001', date: '2026-09-15', time: '09:00',
      })
      await createBooking({
        serviceId: service.id, clientName: 'Different Day', clientEmail: 'c@example.com',
        clientPhone: '07000000002', date: '2026-09-16', time: '09:00',
      })

      const todays = await listBookingsForDate('2026-09-15')
      expect(todays.map((b) => b.clientName)).toEqual(['Earlier Today', 'Later Today'])
    })

    it('excludes cancelled bookings', async () => {
      const service = await createService({
        name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
      })
      const booking = await createBooking({
        serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
        clientPhone: '07000000000', date: '2026-09-15', time: '10:00',
      })
      expect(booking.ok).toBe(true)
      if (!booking.ok) return

      await updateBookingStatus(booking.booking.id, 'cancelled')

      expect(await listBookingsForDate('2026-09-15')).toHaveLength(0)
    })

    it('returns an empty array for a date with no bookings', async () => {
      expect(await listBookingsForDate('2026-09-20')).toEqual([])
    })
  })
})
