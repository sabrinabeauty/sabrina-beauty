// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createBooking } from '@/lib/bookings'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { serviceId, clientName, clientEmail, clientPhone, date, time } = body

  if (!serviceId || !clientName || !clientEmail || !clientPhone || !date || !time) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const result = createBooking({ serviceId, clientName, clientEmail, clientPhone, date, time })
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 })
  }
  return NextResponse.json(result, { status: 201 })
}
