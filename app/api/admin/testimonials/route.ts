import { NextRequest, NextResponse } from 'next/server'
import { listTestimonials, createTestimonial } from '@/lib/testimonials'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  return NextResponse.json(await listTestimonials())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const testimonial = await createTestimonial(body)
  return NextResponse.json(testimonial, { status: 201 })
}
