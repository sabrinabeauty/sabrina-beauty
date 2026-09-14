import { sql, ensureSchema } from './db'
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

export async function getAvailableSlots(serviceId: number, date: string): Promise<string[]> {
  const service = await getService(serviceId)
  if (!service) return []
  await ensureSchema()
  const { rows } = await sql<{ time: string }>`
    SELECT time FROM bookings WHERE date = ${date} AND status != 'cancelled'
  `
  const taken = new Set(rows.map((r) => r.time))
  const slots = await generateSlots(date, service.durationMinutes)
  const result: string[] = []
  for (const slot of slots) {
    if (taken.has(slot)) continue
    if (await isSlotBlocked(date, slot)) continue
    result.push(slot)
  }
  return result
}

export async function createBooking(
  input: Omit<Booking, 'id' | 'status' | 'createdAt'>
): Promise<{ ok: true; booking: Booking } | { ok: false; error: 'slot_unavailable' }> {
  const available = await getAvailableSlots(input.serviceId, input.date)
  if (!available.includes(input.time)) {
    return { ok: false, error: 'slot_unavailable' }
  }

  await ensureSchema()
  try {
    const { rows } = await sql<BookingRow>`
      INSERT INTO bookings (service_id, client_name, client_email, client_phone, date, time)
      VALUES (${input.serviceId}, ${input.clientName}, ${input.clientEmail}, ${input.clientPhone}, ${input.date}, ${input.time})
      RETURNING *
    `
    return { ok: true, booking: rowToBooking(rows[0]) }
  } catch (err) {
    // UNIQUE(date, time) constraint caught a race between the availability check and insert
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return { ok: false, error: 'slot_unavailable' }
    }
    throw err
  }
}

export async function listBookings(): Promise<Booking[]> {
  await ensureSchema()
  const { rows } = await sql<BookingRow>`SELECT * FROM bookings ORDER BY date, time`
  return rows.map(rowToBooking)
}

export async function updateBookingStatus(id: number, status: Booking['status']): Promise<Booking> {
  await ensureSchema()
  const { rows } = await sql<BookingRow>`
    UPDATE bookings SET status = ${status} WHERE id = ${id} RETURNING *
  `
  return rowToBooking(rows[0])
}
