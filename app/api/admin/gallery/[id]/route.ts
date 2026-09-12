import { NextRequest, NextResponse } from 'next/server'
import { deactivateGalleryImage, deleteGalleryImage } from '@/lib/gallery'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const hard = request.nextUrl.searchParams.get('hard') === 'true'
  if (hard) {
    deleteGalleryImage(Number(params.id))
  } else {
    deactivateGalleryImage(Number(params.id))
  }
  return NextResponse.json({ ok: true })
}
