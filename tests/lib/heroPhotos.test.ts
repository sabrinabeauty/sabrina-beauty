import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createHeroPhoto, deleteHeroPhoto, listHeroPhotos } from '../../lib/heroPhotos'

beforeEach(async () => {
  await resetDbForTests()
})

describe('hero photos data layer', () => {
  it('creates a hero photo and lists it', async () => {
    await createHeroPhoto('https://example.com/blob/hero-1.jpg')
    const photos = await listHeroPhotos()
    expect(photos).toHaveLength(1)
    expect(photos[0].imagePath).toBe('https://example.com/blob/hero-1.jpg')
  })

  it('lists multiple photos newest first', async () => {
    await createHeroPhoto('https://example.com/blob/hero-1.jpg')
    await createHeroPhoto('https://example.com/blob/hero-2.jpg')
    const photos = await listHeroPhotos()
    expect(photos).toHaveLength(2)
    expect(photos[0].imagePath).toBe('https://example.com/blob/hero-2.jpg')
    expect(photos[1].imagePath).toBe('https://example.com/blob/hero-1.jpg')
  })

  it('deleteHeroPhoto removes it from the listing', async () => {
    const photo = await createHeroPhoto('https://example.com/blob/hero-1.jpg')
    await deleteHeroPhoto(photo.id)
    expect(await listHeroPhotos()).toHaveLength(0)
  })
})
