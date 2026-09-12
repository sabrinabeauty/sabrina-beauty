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

