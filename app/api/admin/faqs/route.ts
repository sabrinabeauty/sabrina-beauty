import { NextRequest, NextResponse } from 'next/server'
import { listFaqs, createFaq } from '@/lib/faqs'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  return NextResponse.json(await listFaqs())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const faq = await createFaq(body)
  return NextResponse.json(faq, { status: 201 })
}
