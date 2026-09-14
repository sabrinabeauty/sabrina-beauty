import { NextRequest, NextResponse } from 'next/server'
import { saveUploadedImage } from '@/lib/upload'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const result = await saveUploadedImage(formData.get('file'), 'hero')
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ imagePath: result.imagePath }, { status: 201 })
}
