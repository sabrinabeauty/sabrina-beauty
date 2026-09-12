import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-settings.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('settings', () => {
  it('getHomepageVariant defaults to "new" when unset', async () => {
    const { getHomepageVariant } = await import('../../lib/settings')
    expect(getHomepageVariant()).toBe('new')
  })

  it('setHomepageVariant persists and getHomepageVariant reflects it', async () => {
    const { getHomepageVariant, setHomepageVariant } = await import('../../lib/settings')
    setHomepageVariant('original')
    expect(getHomepageVariant()).toBe('original')
    setHomepageVariant('new')
    expect(getHomepageVariant()).toBe('new')
  })

  it('getAdminPasswordHash returns undefined when never set', async () => {
    const { getAdminPasswordHash } = await import('../../lib/settings')
    expect(getAdminPasswordHash()).toBeUndefined()
  })

  it('setAdminPasswordHash persists and getAdminPasswordHash reflects it', async () => {
    const { getAdminPasswordHash, setAdminPasswordHash } = await import('../../lib/settings')
    setAdminPasswordHash('some-bcrypt-hash')
    expect(getAdminPasswordHash()).toBe('some-bcrypt-hash')
  })

  it('getSiteContent returns sensible defaults when nothing has been set', async () => {
    const { getSiteContent } = await import('../../lib/settings')
    const content = getSiteContent()
    expect(content.announcementEnabled).toBe(false)
    expect(content.announcementMessage).toBe('')
    expect(content.contactEmail).toBe('info@s1botanicals.co.uk')
    expect(content.workingHours[0]).toBeNull() // Sunday closed by default
    expect(content.workingHours[2]).toEqual({ start: '09:00', end: '17:30' }) // Tuesday
  })

  it('updateSiteContent persists a partial update and leaves other fields untouched', async () => {
    const { getSiteContent, updateSiteContent } = await import('../../lib/settings')
    updateSiteContent({ announcementEnabled: true, announcementMessage: 'Away until 20 Sept' })
    const content = getSiteContent()
    expect(content.announcementEnabled).toBe(true)
    expect(content.announcementMessage).toBe('Away until 20 Sept')
    expect(content.contactEmail).toBe('info@s1botanicals.co.uk') // untouched default

    updateSiteContent({
      workingHours: { ...content.workingHours, 1: { start: '10:00', end: '16:00' } },
    })
    const updated = getSiteContent()
    expect(updated.workingHours[1]).toEqual({ start: '10:00', end: '16:00' })
    expect(updated.announcementMessage).toBe('Away until 20 Sept') // still untouched
  })
})
