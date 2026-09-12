// app/api/services/route.ts
import { NextResponse } from 'next/server'
import { listServices } from '@/lib/services'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(listServices({ activeOnly: true }))
}
