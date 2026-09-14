import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import {
  getHomepageVariant,
  setHomepageVariant,
  getAdminPasswordHash,
  setAdminPasswordHash,
  getSiteContent,
  updateSiteContent,
} from '../../lib/settings'

beforeEach(async () => {
  await resetDbForTests()
})

describe('settings', () => {
  it('getHomepageVariant defaults to "new" when unset', async () => {
    expect(await getHomepageVariant()).toBe('new')
  })

  it('setHomepageVariant persists and getHomepageVariant reflects it', async () => {
    await setHomepageVariant('original')
    expect(await getHomepageVariant()).toBe('original')
    await setHomepageVariant('new')
    expect(await getHomepageVariant()).toBe('new')
  })

  it('getAdminPasswordHash returns undefined when never set', async () => {
    expect(await getAdminPasswordHash()).toBeUndefined()
  })

  it('setAdminPasswordHash persists and getAdminPasswordHash reflects it', async () => {
    await setAdminPasswordHash('some-bcrypt-hash')
    expect(await getAdminPasswordHash()).toBe('some-bcrypt-hash')
  })

  it('getSiteContent returns sensible defaults when nothing has been set', async () => {
    const content = await getSiteContent()
    expect(content.announcementEnabled).toBe(false)
    expect(content.announcementMessage).toBe('')
    expect(content.contactEmail).toBe('info@s1botanicals.co.uk')
    expect(content.workingHours[0]).toBeNull() // Sunday closed by default
    expect(content.workingHours[2]).toEqual({ start: '09:00', end: '17:30' }) // Tuesday
    expect(content.heroImagePath).toBeNull()
  })

  it('updateSiteContent persists a custom hero image and can clear it back to null', async () => {
    await updateSiteContent({ heroImagePath: 'https://example.com/blob/hero-photo.jpg' })
    expect((await getSiteContent()).heroImagePath).toBe('https://example.com/blob/hero-photo.jpg')

    await updateSiteContent({ heroImagePath: null })
    expect((await getSiteContent()).heroImagePath).toBeNull()
  })

  it('updateSiteContent persists a partial update and leaves other fields untouched', async () => {
    await updateSiteContent({ announcementEnabled: true, announcementMessage: 'Away until 20 Sept' })
    const content = await getSiteContent()
    expect(content.announcementEnabled).toBe(true)
    expect(content.announcementMessage).toBe('Away until 20 Sept')
    expect(content.contactEmail).toBe('info@s1botanicals.co.uk') // untouched default

    await updateSiteContent({
      workingHours: { ...content.workingHours, 1: { start: '10:00', end: '16:00' } },
    })
    const updated = await getSiteContent()
    expect(updated.workingHours[1]).toEqual({ start: '10:00', end: '16:00' })
    expect(updated.announcementMessage).toBe('Away until 20 Sept') // still untouched
  })
})
