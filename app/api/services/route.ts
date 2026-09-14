// app/api/services/route.ts
import { NextResponse } from 'next/server'
import { listServices } from '@/lib/services'

export const fetchCache = 'force-no-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await listServices({ activeOnly: true }))
}
