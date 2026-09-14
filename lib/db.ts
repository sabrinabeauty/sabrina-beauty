import { sql } from '@vercel/postgres'

let schemaReady: Promise<void> | null = null

async function createSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('facial','brow')),
      description TEXT NOT NULL,
      price_pence INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      service_id INTEGER NOT NULL REFERENCES services(id),
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(date, time)
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS blocked_slots (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT,
      UNIQUE(date, time)
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price_pence INTEGER NOT NULL,
      image_path TEXT,
      active BOOLEAN NOT NULL DEFAULT true
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL,
      quote TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id SERIAL PRIMARY KEY,
      image_path TEXT NOT NULL,
      caption TEXT,
      active BOOLEAN NOT NULL DEFAULT true
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS hero_photos (
      id SERIAL PRIMARY KEY,
      image_path TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `
}

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = createSchema().catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

export async function resetDbForTests(): Promise<void> {
  await ensureSchema()
  await sql`
    TRUNCATE TABLE services, bookings, blocked_slots, settings, products, faqs, testimonials, gallery_images, hero_photos
    RESTART IDENTITY CASCADE
  `
}

export { sql }
