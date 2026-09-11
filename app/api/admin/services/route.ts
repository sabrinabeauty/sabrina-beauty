// app/api/admin/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { listServices, createService } from '@/lib/services'

export async function GET() {
  return NextResponse.json(listServices())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const service = createService(body)
  return NextResponse.json(service, { status: 201 })
}
