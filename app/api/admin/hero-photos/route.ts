import { NextRequest, NextResponse } from 'next/server'
import { listHeroPhotos, createHeroPhoto } from '@/lib/heroPhotos'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  return NextResponse.json(await listHeroPhotos())
}

export async function POST(request: NextRequest) {
  const { imagePath } = await request.json()
  if (typeof imagePath !== 'string' || !imagePath) {
    return NextResponse.json({ error: 'imagePath_required' }, { status: 400 })
  }
  const photo = await createHeroPhoto(imagePath)
  return NextResponse.json(photo, { status: 201 })
}
