import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 })
  }

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'unsupported_type' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 400 })
  }

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
  fs.mkdirSync(uploadDir, { recursive: true })

  const bytes = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(path.join(uploadDir, filename), bytes)

  return NextResponse.json({ imagePath: `/uploads/products/${filename}` }, { status: 201 })
}
