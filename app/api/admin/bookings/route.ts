// app/api/admin/bookings/route.ts
import { NextResponse } from 'next/server'
import { listBookings } from '@/lib/bookings'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  return NextResponse.json(await listBookings())
}
