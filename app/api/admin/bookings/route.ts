// app/api/admin/bookings/route.ts
import { NextResponse } from 'next/server'
import { listBookings } from '@/lib/bookings'

export async function GET() {
  return NextResponse.json(listBookings())
}
