import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export type SaveImageResult =
  | { ok: true; imagePath: string }
  | { ok: false; error: 'no_file' | 'unsupported_type' | 'file_too_large' }

export async function saveUploadedImage(file: unknown, subdir: string): Promise<SaveImageResult> {
  if (!(file instanceof File)) {
    return { ok: false, error: 'no_file' }
  }

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return { ok: false, error: 'unsupported_type' }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'file_too_large' }
  }

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir)
  fs.mkdirSync(uploadDir, { recursive: true })

  const bytes = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(path.join(uploadDir, filename), bytes)

  return { ok: true, imagePath: `/uploads/${subdir}/${filename}` }
}
