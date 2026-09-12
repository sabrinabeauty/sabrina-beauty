import { NextRequest, NextResponse } from 'next/server'
import { getSiteContent, updateSiteContent } from '@/lib/settings'

export async function GET() {
  return NextResponse.json(getSiteContent())
}

export async function POST(request: NextRequest) {
  const partial = await request.json()
  const updated = updateSiteContent(partial)
  return NextResponse.json(updated)
}
