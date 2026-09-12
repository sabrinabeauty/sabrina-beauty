import { NextRequest, NextResponse } from 'next/server'
import { getHomepageVariant, setHomepageVariant } from '@/lib/settings'

export async function GET() {
  return NextResponse.json({ homepageVariant: getHomepageVariant() })
}

export async function POST(request: NextRequest) {
  const { homepageVariant } = await request.json()
  if (homepageVariant !== 'original' && homepageVariant !== 'new') {
    return NextResponse.json({ error: 'invalid_variant' }, { status: 400 })
  }
  setHomepageVariant(homepageVariant)
  return NextResponse.json({ homepageVariant })
}
