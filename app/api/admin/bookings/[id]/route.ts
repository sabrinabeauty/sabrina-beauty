// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateBookingStatus } from '@/lib/bookings'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await request.json()
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
  }
  const booking = await updateBookingStatus(Number(params.id), status)
  return NextResponse.json(booking)
}
