import { getDb } from './db'

export type HomepageVariant = 'original' | 'new'

const HOMEPAGE_VARIANT_KEY = 'homepage_variant'
const DEFAULT_HOMEPAGE_VARIANT: HomepageVariant = 'new'

export function getSetting(key: string): string | undefined {
  const db = getDb()
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value
}

export function setSetting(key: string, value: string): void {
  const db = getDb()
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value)
}

export function getHomepageVariant(): HomepageVariant {
  const value = getSetting(HOMEPAGE_VARIANT_KEY)
  return value === 'original' ? 'original' : DEFAULT_HOMEPAGE_VARIANT
}

export function setHomepageVariant(variant: HomepageVariant): void {
  setSetting(HOMEPAGE_VARIANT_KEY, variant)
}

const ADMIN_PASSWORD_HASH_KEY = 'admin_password_hash'

export function getAdminPasswordHash(): string | undefined {
  return getSetting(ADMIN_PASSWORD_HASH_KEY)
}

export function setAdminPasswordHash(hash: string): void {
  setSetting(ADMIN_PASSWORD_HASH_KEY, hash)
}

export type DayHours = { start: string; end: string } | null
export type WorkingHours = Record<number, DayHours> // 0=Sunday .. 6=Saturday

export type SiteContent = {
  announcementEnabled: boolean
  announcementMessage: string
  contactEmail: string
  contactWhatsapp: string
  contactInstagram: string
  contactTiktok: string
  contactFacebook: string
  heroHeadline: string
  heroTagline: string
  aboutHeading: string
  aboutBody: string
  workingHours: WorkingHours
}

const DEFAULT_WORKING_HOURS: WorkingHours = {
  0: null,
  1: null,
  2: { start: '09:00', end: '17:30' },
  3: { start: '09:00', end: '17:30' },
  4: { start: '09:00', end: '17:30' },
  5: { start: '09:00', end: '17:30' },
  6: { start: '09:00', end: '17:30' },
}

const SITE_CONTENT_DEFAULTS: SiteContent = {
  announcementEnabled: false,
  announcementMessage: '',
  contactEmail: 'info@s1botanicals.co.uk',
  contactWhatsapp: '+44 7494 700707',
  contactInstagram: 'https://instagram.com/Sabrinabeauty.studioo',
  contactTiktok: 'https://tiktok.com/@botanicalessence7',
  contactFacebook: 'https://facebook.com/Sabrinabeauty7',
  heroHeadline: 'Welcome to Sabrina Beauty',
  heroTagline:
    'Your sanctuary for luxurious, results-focused facial treatments designed to enhance your natural beauty.',
  aboutHeading: 'Our Story, Your Glow',
  aboutBody:
    'Sabrina Beauty was born from a passion for skincare and a belief that beautiful skin begins with thoughtful, personalised care.\n\nOur approach combines carefully selected botanical ingredients with professional skincare techniques to nourish, refresh and enhance your skin’s natural radiance.\n\nEvery treatment is designed with care, creating a relaxing experience that leaves your skin feeling nourished, renewed, and glowing from within — and you feeling calm, cared for, and confident.',
  workingHours: DEFAULT_WORKING_HOURS,
}

const SITE_CONTENT_KEY = 'site_content'

export function getSiteContent(): SiteContent {
  const raw = getSetting(SITE_CONTENT_KEY)
  if (!raw) return SITE_CONTENT_DEFAULTS
  try {
    return { ...SITE_CONTENT_DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return SITE_CONTENT_DEFAULTS
  }
}

export function updateSiteContent(partial: Partial<SiteContent>): SiteContent {
  const merged = { ...getSiteContent(), ...partial }
  setSetting(SITE_CONTENT_KEY, JSON.stringify(merged))
  return merged
}

