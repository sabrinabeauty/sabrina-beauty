import { getDb } from './db'
import { getService } from './services'
import { generateSlots, isSlotBlocked } from './availability'

export type Booking = {
  id: number
  serviceId: number
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

type BookingRow = {
  id: number
  service_id: number
  client_name: string
  client_email: string
  client_phone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    serviceId: row.service_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    date: row.date,
    time: row.time,
    status: row.status,
    createdAt: row.created_at,
  }
}

export function getAvailableSlots(serviceId: number, date: string): string[] {
  const service = getService(serviceId)
  if (!service) return []
  const db = getDb()
  const taken = new Set(
    (db
      .prepare("SELECT time FROM bookings WHERE date = ? AND status != 'cancelled'")
      .all(date) as { time: string }[])
      .map((r) => r.time)
  )
  return generateSlots(date, service.durationMinutes).filter(
    (slot) => !taken.has(slot) && !isSlotBlocked(date, slot)
  )
}

export function createBooking(
  input: Omit<Booking, 'id' | 'status' | 'createdAt'>
): { ok: true; booking: Booking } | { ok: false; error: 'slot_unavailable' } {
  const available = getAvailableSlots(input.serviceId, input.date)
  if (!available.includes(input.time)) {
    return { ok: false, error: 'slot_unavailable' }
  }

  const db = getDb()
  try {
    const result = db
      .prepare(
        `INSERT INTO bookings (service_id, client_name, client_email, client_phone, date, time)
         VALUES (@serviceId, @clientName, @clientEmail, @clientPhone, @date, @time)`
      )
      .run(input)
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid) as BookingRow
    return { ok: true, booking: rowToBooking(row) }
  } catch {
    // UNIQUE(date, time) constraint caught a race between the availability check and insert
    return { ok: false, error: 'slot_unavailable' }
  }
}

export function listBookings(): Booking[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM bookings ORDER BY date, time').all() as BookingRow[]
  return rows.map(rowToBooking)
}

export function updateBookingStatus(id: number, status: Booking['status']): Booking {
  const db = getDb()
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id)
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as BookingRow
  return rowToBooking(row)
}
