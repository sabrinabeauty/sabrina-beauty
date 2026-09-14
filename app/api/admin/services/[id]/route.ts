// app/api/admin/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateService, deactivateService } from '@/lib/services'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const service = await updateService(Number(params.id), body)
  return NextResponse.json(service)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  await deactivateService(Number(params.id))
  return NextResponse.json({ ok: true })
}
