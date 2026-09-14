// app/api/admin/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { listServices, createService } from '@/lib/services'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  return NextResponse.json(await listServices())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const service = await createService(body)
  return NextResponse.json(service, { status: 201 })
}
