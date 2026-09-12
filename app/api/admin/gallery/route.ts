import { NextRequest, NextResponse } from 'next/server'
import { listGalleryImages, createGalleryImage } from '@/lib/gallery'

export async function GET() {
  return NextResponse.json(listGalleryImages())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const image = createGalleryImage(body)
  return NextResponse.json(image, { status: 201 })
}
