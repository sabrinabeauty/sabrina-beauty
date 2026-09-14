import { NextRequest, NextResponse } from 'next/server'
import { deactivateGalleryImage, deleteGalleryImage } from '@/lib/gallery'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const hard = request.nextUrl.searchParams.get('hard') === 'true'
  if (hard) {
    await deleteGalleryImage(Number(params.id))
  } else {
    await deactivateGalleryImage(Number(params.id))
  }
  return NextResponse.json({ ok: true })
}
