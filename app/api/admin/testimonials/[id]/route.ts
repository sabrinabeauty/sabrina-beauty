import { NextRequest, NextResponse } from 'next/server'
import { updateTestimonial, deleteTestimonial } from '@/lib/testimonials'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const testimonial = updateTestimonial(Number(params.id), body)
  return NextResponse.json(testimonial)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  deleteTestimonial(Number(params.id))
  return NextResponse.json({ ok: true })
}
