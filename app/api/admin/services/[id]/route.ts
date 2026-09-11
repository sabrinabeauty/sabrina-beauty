// app/api/admin/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateService, deactivateService } from '@/lib/services'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const service = updateService(Number(params.id), body)
  return NextResponse.json(service)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  deactivateService(Number(params.id))
  return NextResponse.json({ ok: true })
}
