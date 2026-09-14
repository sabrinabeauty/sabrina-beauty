import { NextRequest, NextResponse } from 'next/server'
import { updateTestimonial, deleteTestimonial } from '@/lib/testimonials'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const testimonial = await updateTestimonial(Number(params.id), body)
  return NextResponse.json(testimonial)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  await deleteTestimonial(Number(params.id))
  return NextResponse.json({ ok: true })
}
