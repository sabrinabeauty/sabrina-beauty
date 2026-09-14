import { NextRequest, NextResponse } from 'next/server'
import { updateFaq, deleteFaq } from '@/lib/faqs'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const faq = await updateFaq(Number(params.id), body)
  return NextResponse.json(faq)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  await deleteFaq(Number(params.id))
  return NextResponse.json({ ok: true })
}
