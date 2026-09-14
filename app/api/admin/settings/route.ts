import { NextRequest, NextResponse } from 'next/server'
import { getHomepageVariant, setHomepageVariant } from '@/lib/settings'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  return NextResponse.json({ homepageVariant: await getHomepageVariant() })
}

export async function POST(request: NextRequest) {
  const { homepageVariant } = await request.json()
  if (homepageVariant !== 'original' && homepageVariant !== 'new') {
    return NextResponse.json({ error: 'invalid_variant' }, { status: 400 })
  }
  await setHomepageVariant(homepageVariant)
  return NextResponse.json({ homepageVariant })
}
