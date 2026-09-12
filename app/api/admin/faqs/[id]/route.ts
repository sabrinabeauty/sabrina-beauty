import { NextRequest, NextResponse } from 'next/server'
import { updateFaq, deleteFaq } from '@/lib/faqs'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const faq = updateFaq(Number(params.id), body)
  return NextResponse.json(faq)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  deleteFaq(Number(params.id))
  return NextResponse.json({ ok: true })
}
