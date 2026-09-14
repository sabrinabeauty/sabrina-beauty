import { NextRequest, NextResponse } from 'next/server'
import { deleteHeroPhoto } from '@/lib/heroPhotos'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  await deleteHeroPhoto(Number(params.id))
  return NextResponse.json({ ok: true })
}
