import { NextRequest, NextResponse } from 'next/server'
import { listGalleryImages, createGalleryImage } from '@/lib/gallery'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  return NextResponse.json(await listGalleryImages())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const image = await createGalleryImage(body)
  return NextResponse.json(image, { status: 201 })
}
