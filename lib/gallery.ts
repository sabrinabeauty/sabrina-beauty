import { sql, ensureSchema } from './db'

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
  active: boolean
}

function rowToGalleryImage(row: GalleryImageRow): GalleryImage {
  return { id: row.id, imagePath: row.image_path, caption: row.caption, active: row.active }
}

export async function listGalleryImages(opts: { activeOnly?: boolean } = {}): Promise<GalleryImage[]> {
  await ensureSchema()
  const { rows } = opts.activeOnly
    ? await sql<GalleryImageRow>`SELECT * FROM gallery_images WHERE active = true ORDER BY id DESC`
    : await sql<GalleryImageRow>`SELECT * FROM gallery_images ORDER BY id DESC`
  return rows.map(rowToGalleryImage)
}

export async function getGalleryImage(id: number): Promise<GalleryImage | undefined> {
  await ensureSchema()
  const { rows } = await sql<GalleryImageRow>`SELECT * FROM gallery_images WHERE id = ${id}`
  return rows[0] ? rowToGalleryImage(rows[0]) : undefined
}

export async function createGalleryImage(input: Omit<GalleryImage, 'id'>): Promise<GalleryImage> {
  await ensureSchema()
  const { rows } = await sql<GalleryImageRow>`
    INSERT INTO gallery_images (image_path, caption, active) VALUES (${input.imagePath}, ${input.caption}, ${input.active})
    RETURNING *
  `
  return rowToGalleryImage(rows[0])
}

export async function deactivateGalleryImage(id: number): Promise<void> {
  await ensureSchema()
  await sql`UPDATE gallery_images SET active = false WHERE id = ${id}`
}

export async function deleteGalleryImage(id: number): Promise<void> {
  await ensureSchema()
  await sql`DELETE FROM gallery_images WHERE id = ${id}`
}
