import { NextRequest, NextResponse } from 'next/server'
import { getSiteContent, updateSiteContent } from '@/lib/settings'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  return NextResponse.json(await getSiteContent())
}

export async function POST(request: NextRequest) {
  const partial = await request.json()
  const updated = await updateSiteContent(partial)
  return NextResponse.json(updated)
}
