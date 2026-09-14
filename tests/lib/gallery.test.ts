import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createGalleryImage, deactivateGalleryImage, listGalleryImages } from '../../lib/gallery'

beforeEach(async () => {
  await resetDbForTests()
})

describe('gallery data layer', () => {
  it('creates a gallery image and lists it', async () => {
    await createGalleryImage({ imagePath: '/uploads/gallery/1.jpg', caption: 'Before & after', active: true })
    const images = await listGalleryImages()
    expect(images).toHaveLength(1)
    expect(images[0].caption).toBe('Before & after')
  })

  it('deactivateGalleryImage hides it from activeOnly listing but keeps it in full listing', async () => {
    const g = await createGalleryImage({ imagePath: '/uploads/gallery/1.jpg', caption: null, active: true })
    await deactivateGalleryImage(g.id)
    expect(await listGalleryImages({ activeOnly: true })).toHaveLength(0)
    expect(await listGalleryImages({ activeOnly: false })).toHaveLength(1)
  })
})
