import { NextRequest, NextResponse } from 'next/server'
import { listFaqs, createFaq } from '@/lib/faqs'

export async function GET() {
  return NextResponse.json(listFaqs())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const faq = createFaq(body)
  return NextResponse.json(faq, { status: 201 })
}
