// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createBooking } from '@/lib/bookings'
import { getService } from '@/lib/services'
import { sendBookingNotification } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { serviceId, clientName, clientEmail, clientPhone, date, time } = body

  if (!serviceId || !clientName || !clientEmail || !clientPhone || !date || !time) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const result = await createBooking({ serviceId, clientName, clientEmail, clientPhone, date, time })
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 })
  }

  // The booking is already committed at this point — a notification
  // failure (Resend down, bad API key, etc.) must never turn a successful
  // booking into an error response for the customer. Logged loudly so a
  // persistent failure is discoverable in Vercel's function logs, not
  // silently swallowed.
  try {
    const service = await getService(result.booking.serviceId)
    if (service) {
      await sendBookingNotification(result.booking, service)
    } else {
      console.error(`Booking ${result.booking.id}: service ${result.booking.serviceId} not found, notification skipped`)
    }
  } catch (err) {
    console.error(`Booking ${result.booking.id}: notification email failed`, err)
  }

  return NextResponse.json(result, { status: 201 })
}
