import { NextRequest, NextResponse } from 'next/server'
import { listTestimonials, createTestimonial } from '@/lib/testimonials'

export async function GET() {
  return NextResponse.json(listTestimonials())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const testimonial = createTestimonial(body)
  return NextResponse.json(testimonial, { status: 201 })
}
