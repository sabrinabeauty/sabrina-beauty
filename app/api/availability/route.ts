// app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/bookings'

export async function GET(request: NextRequest) {
  const serviceId = Number(request.nextUrl.searchParams.get('serviceId'))
  const date = request.nextUrl.searchParams.get('date')
  if (!serviceId || !date) {
    return NextResponse.json({ error: 'serviceId and date are required' }, { status: 400 })
  }
  return NextResponse.json(getAvailableSlots(serviceId, date))
}
