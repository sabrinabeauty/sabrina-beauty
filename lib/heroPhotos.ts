import { sql, ensureSchema } from './db'

export type HeroPhoto = {
  id: number
  imagePath: string
  createdAt: string
}

type HeroPhotoRow = {
  id: number
  image_path: string
  created_at: string
}

function rowToHeroPhoto(row: HeroPhotoRow): HeroPhoto {
  return { id: row.id, imagePath: row.image_path, createdAt: row.created_at }
}

export async function listHeroPhotos(): Promise<HeroPhoto[]> {
  await ensureSchema()
  const { rows } = await sql<HeroPhotoRow>`SELECT * FROM hero_photos ORDER BY id DESC`
  return rows.map(rowToHeroPhoto)
}

export async function createHeroPhoto(imagePath: string): Promise<HeroPhoto> {
  await ensureSchema()
  const { rows } = await sql<HeroPhotoRow>`
    INSERT INTO hero_photos (image_path) VALUES (${imagePath}) RETURNING *
  `
  return rowToHeroPhoto(rows[0])
}

export async function deleteHeroPhoto(id: number): Promise<void> {
  await ensureSchema()
  await sql`DELETE FROM hero_photos WHERE id = ${id}`
}
