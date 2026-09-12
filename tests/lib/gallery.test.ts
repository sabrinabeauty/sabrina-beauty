import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-gallery.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('gallery data layer', () => {
  it('creates a gallery image and lists it', async () => {
    const { createGalleryImage, listGalleryImages } = await import('../../lib/gallery')
    createGalleryImage({ imagePath: '/uploads/gallery/1.jpg', caption: 'Before & after', active: true })
    const images = listGalleryImages()
    expect(images).toHaveLength(1)
    expect(images[0].caption).toBe('Before & after')
  })

  it('deactivateGalleryImage hides it from activeOnly listing but keeps it in full listing', async () => {
    const { createGalleryImage, deactivateGalleryImage, listGalleryImages } = await import(
      '../../lib/gallery'
    )
    const g = createGalleryImage({ imagePath: '/uploads/gallery/1.jpg', caption: null, active: true })
    deactivateGalleryImage(g.id)
    expect(listGalleryImages({ activeOnly: true })).toHaveLength(0)
    expect(listGalleryImages({ activeOnly: false })).toHaveLength(1)
  })
})
