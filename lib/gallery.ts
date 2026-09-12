import { getDb } from './db'

export type GalleryImage = {
  id: number
  imagePath: string
  caption: string | null
  active: boolean
}

type GalleryImageRow = {
  id: number
  image_path: string
  caption: string | null
  active: number
}

function rowToGalleryImage(row: GalleryImageRow): GalleryImage {
  return { id: row.id, imagePath: row.image_path, caption: row.caption, active: row.active === 1 }
}

export function listGalleryImages(opts: { activeOnly?: boolean } = {}): GalleryImage[] {
  const db = getDb()
  const rows = opts.activeOnly
    ? db.prepare('SELECT * FROM gallery_images WHERE active = 1 ORDER BY id DESC').all()
    : db.prepare('SELECT * FROM gallery_images ORDER BY id DESC').all()
  return (rows as GalleryImageRow[]).map(rowToGalleryImage)
}

export function getGalleryImage(id: number): GalleryImage | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(id) as GalleryImageRow | undefined
  return row ? rowToGalleryImage(row) : undefined
}

export function createGalleryImage(input: Omit<GalleryImage, 'id'>): GalleryImage {
  const db = getDb()
  const result = db
    .prepare(
      'INSERT INTO gallery_images (image_path, caption, active) VALUES (@imagePath, @caption, @active)'
    )
    .run({ ...input, active: input.active ? 1 : 0 })
  return getGalleryImage(result.lastInsertRowid as number)!
}

export function deactivateGalleryImage(id: number): void {
  const db = getDb()
  db.prepare('UPDATE gallery_images SET active = 0 WHERE id = ?').run(id)
}

export function deleteGalleryImage(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM gallery_images WHERE id = ?').run(id)
}
