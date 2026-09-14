import { sql, ensureSchema } from './db'

export type HomepageVariant = 'original' | 'new'

const HOMEPAGE_VARIANT_KEY = 'homepage_variant'
const DEFAULT_HOMEPAGE_VARIANT: HomepageVariant = 'new'

export async function getSetting(key: string): Promise<string | undefined> {
  await ensureSchema()
  const { rows } = await sql<{ value: string }>`SELECT value FROM settings WHERE key = ${key}`
  return rows[0]?.value
}

export async function setSetting(key: string, value: string): Promise<void> {
  await ensureSchema()
  await sql`
    INSERT INTO settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = excluded.value
  `
}

export async function getHomepageVariant(): Promise<HomepageVariant> {
  const value = await getSetting(HOMEPAGE_VARIANT_KEY)
  return value === 'original' ? 'original' : DEFAULT_HOMEPAGE_VARIANT
}

export async function setHomepageVariant(variant: HomepageVariant): Promise<void> {
  await setSetting(HOMEPAGE_VARIANT_KEY, variant)
}

const ADMIN_PASSWORD_HASH_KEY = 'admin_password_hash'

export async function getAdminPasswordHash(): Promise<string | undefined> {
  return getSetting(ADMIN_PASSWORD_HASH_KEY)
}

export async function setAdminPasswordHash(hash: string): Promise<void> {
  await setSetting(ADMIN_PASSWORD_HASH_KEY, hash)
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
  heroImagePath: string | null
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
  heroImagePath: null,
  aboutHeading: 'Our Story, Your Glow',
  aboutBody:
    'Sabrina Beauty was born from a passion for skincare and a belief that beautiful skin begins with thoughtful, personalised care.\n\nOur approach combines carefully selected botanical ingredients with professional skincare techniques to nourish, refresh and enhance your skin’s natural radiance.\n\nEvery treatment is designed with care, creating a relaxing experience that leaves your skin feeling nourished, renewed, and glowing from within — and you feeling calm, cared for, and confident.',
  workingHours: DEFAULT_WORKING_HOURS,
}

const SITE_CONTENT_KEY = 'site_content'

export async function getSiteContent(): Promise<SiteContent> {
  const raw = await getSetting(SITE_CONTENT_KEY)
  if (!raw) return SITE_CONTENT_DEFAULTS
  try {
    return { ...SITE_CONTENT_DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return SITE_CONTENT_DEFAULTS
  }
}

export async function updateSiteContent(partial: Partial<SiteContent>): Promise<SiteContent> {
  const merged = { ...(await getSiteContent()), ...partial }
  await setSetting(SITE_CONTENT_KEY, JSON.stringify(merged))
  return merged
}
