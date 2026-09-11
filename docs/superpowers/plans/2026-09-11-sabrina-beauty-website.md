# Sabrina Beauty Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, zero-cost, self-contained Next.js website for Sabrina Beauty (rebranded from Samar Beauty) with a full treatment menu, custom booking flow, password-protected admin panel, and a modern-luxury-spa visual design using real professional stock photography.

**Architecture:** Next.js 14 (App Router, TypeScript) monolith. `better-sqlite3` for local persistence (file at `data/sabrina.db`, gitignored). Tailwind CSS for styling. No external paid services — session auth via a signed cookie (HMAC, no third-party auth lib), images sourced from Unsplash (free license, no API key required for direct CDN hotlink of specific photos).

**Tech Stack:** Next.js 14 + TypeScript, better-sqlite3, Tailwind CSS, bcryptjs (password hashing), Vitest (unit tests) + Next.js test conventions.

## Global Constraints

- Zero cost, zero external paid accounts. No Stripe/payment integration. No email-sending service.
- Fully self-contained locally: `npm install && npm run dev` must work with no cloud dependency.
- Business name throughout: "Sabrina Beauty" (not "Samar Beauty" or "Botanical Essence" — both are old/inconsistent names found on the current live site and must not appear anywhere in the new copy).
- Contact info to use verbatim: email `info@s1botanicals.co.uk`, WhatsApp/phone `+44 7494 700707`, Instagram `instagram.com/Sabrinabeauty.studioo`, TikTok `tiktok.com/@botanicalessence7`, Facebook `facebook.com/Sabrinabeauty7`. No physical address or opening hours exist — do not fabricate any.
- All 12 treatments (7 facial + 5 brow) and their exact prices/durations from the spec (`docs/superpowers/specs/2026-09-11-sabrina-beauty-website-design.md`) must appear on the Services page. Do not invent new services or change prices.
- Visual direction: "modern luxury spa" — warm off-white base, muted sage/blush accents, deep charcoal text/contrast; elegant serif headings + clean sans body; generous whitespace; large imagery; subtle rounded corners.
- Images must be real, professional, high-quality photography (not clip-art/placeholder-gray-box), sourced free of charge, matching the beauty/skincare/spa subject matter of each section.
- No online payment collection anywhere.
- No automated email confirmations (out of scope, flagged for future).
- Every feature needs a passing test before being considered done (booking creation + double-booking rejection, admin auth gate, service CRUD reflected on public page).

---

## File Structure

```
sabrina-beauty/
  package.json
  tsconfig.json
  tailwind.config.ts
  next.config.mjs
  .env.local.example
  .gitignore
  data/                          (gitignored — sqlite file lives here)
  scripts/
    seed.ts                      (seeds services table with real treatment data)
    hash-password.ts             (CLI helper to generate ADMIN_PASSWORD_HASH)
  lib/
    db.ts                        (better-sqlite3 connection + schema init)
    services.ts                  (service CRUD functions)
    bookings.ts                  (booking CRUD + double-booking check)
    availability.ts              (working-hours slot generation + blocked slots)
    auth.ts                      (password verify, session token sign/verify)
  middleware.ts                  (protects /admin/dashboard + /api/admin/*)
  app/
    layout.tsx
    globals.css
    page.tsx                     (Home)
    services/page.tsx
    about/page.tsx
    book/page.tsx                (client component booking flow)
    admin/page.tsx                (login form)
    admin/dashboard/page.tsx      (protected management UI)
    api/
      services/route.ts           (GET public list)
      availability/route.ts       (GET available slots for service+date)
      bookings/route.ts           (POST create booking)
      admin/login/route.ts        (POST verify password, set cookie)
      admin/logout/route.ts       (POST clear cookie)
      admin/bookings/route.ts     (GET all bookings — admin only)
      admin/bookings/[id]/route.ts (PATCH status — admin only)
      admin/services/route.ts     (GET/POST — admin only)
      admin/services/[id]/route.ts (PATCH/DELETE — admin only)
      admin/blocked-slots/route.ts (GET/POST/DELETE — admin only)
  components/
    Header.tsx
    Footer.tsx
    Logo.tsx                     (SVG wordmark)
    ServiceCard.tsx
    BookingForm.tsx
  public/
    images/
      hero.jpg
      facials.jpg
      brows.jpg
      about.jpg
  tests/
    lib/bookings.test.ts
    lib/services.test.ts
    lib/auth.test.ts
    api/booking-flow.test.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`, `.env.local.example`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (temporary placeholder)

**Interfaces:**
- Produces: a runnable Next.js 14 App Router project with Tailwind configured, TypeScript strict mode, and a documented `.env.local.example` (`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`).

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd ~/Khando/Dev/Projects/sabrina-beauty
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --use-npm
```
When prompted, accept defaults. This creates `package.json`, `tsconfig.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `next.config.mjs`.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install better-sqlite3 bcryptjs
npm install -D @types/better-sqlite3 @types/bcryptjs vitest @vitejs/plugin-react
```

- [ ] **Step 3: Add `.env.local.example`**

```
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
```

- [ ] **Step 4: Extend `.gitignore`**

Append to the existing `.gitignore`:
```
data/*.db
.env.local
```

- [ ] **Step 5: Add `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

- [ ] **Step 6: Add test script to `package.json`**

Add to the `"scripts"` block: `"test": "vitest run"`.

- [ ] **Step 7: Verify dev server boots**

Run: `npm run dev -- --port 4173 &` then `sleep 3 && curl -s -o /dev/null -w "%{http_code}" http://localhost:4173`
Expected: `200`. Then kill the dev server: `kill %1`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js + Tailwind + TypeScript project"
```

---

## Task 2: Database Layer & Schema

**Files:**
- Create: `lib/db.ts`, `tests/lib/db.test.ts`

**Interfaces:**
- Produces: `getDb(): Database.Database` — returns a singleton better-sqlite3 connection with schema already applied (creates tables if missing). Schema:
  - `services(id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL CHECK(category IN ('facial','brow')), description TEXT NOT NULL, price_pence INTEGER NOT NULL, duration_minutes INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1)`
  - `bookings(id INTEGER PRIMARY KEY, service_id INTEGER NOT NULL REFERENCES services(id), client_name TEXT NOT NULL, client_email TEXT NOT NULL, client_phone TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(date, time))`
  - `blocked_slots(id INTEGER PRIMARY KEY, date TEXT NOT NULL, time TEXT, UNIQUE(date, time))` — `time` NULL means the whole day is blocked.
- Consumes: nothing (base layer).

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test.db')

beforeEach(() => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
})

describe('getDb', () => {
  it('creates the services, bookings, and blocked_slots tables', async () => {
    const { getDb } = await import('../../lib/db')
    const db = getDb()
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name)
    expect(tables).toEqual(expect.arrayContaining(['services', 'bookings', 'blocked_slots']))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/db.test.ts`
Expected: FAIL (`lib/db.ts` does not exist / no export `getDb`)

- [ ] **Step 3: Implement `lib/db.ts`**

```typescript
// lib/db.ts
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = process.env.SABRINA_DB_PATH || path.join(process.cwd(), 'data', 'sabrina.db')
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('facial','brow')),
      description TEXT NOT NULL,
      price_pence INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL REFERENCES services(id),
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, time)
    );

    CREATE TABLE IF NOT EXISTS blocked_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT,
      UNIQUE(date, time)
    );
  `)

  return db
}

export function resetDbForTests(): void {
  db = null
}
```

Note: because `getDb` memoizes into a module-level singleton, the test must reset it between runs. Update Step 1's test file to call `resetDbForTests()` in `beforeEach` after importing, and export `resetDbForTests` from `lib/db.ts` as shown above.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/db.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/db.ts tests/lib/db.test.ts
git commit -m "Add SQLite schema and db connection singleton"
```

---

## Task 3: Services Data Layer + Seed Script

**Files:**
- Create: `lib/services.ts`, `scripts/seed.ts`, `tests/lib/services.test.ts`

**Interfaces:**
- Consumes: `getDb()` from `lib/db.ts`.
- Produces:
  - `type Service = { id: number; name: string; category: 'facial' | 'brow'; description: string; pricePence: number; durationMinutes: number; active: boolean }`
  - `listServices(opts?: { activeOnly?: boolean }): Service[]`
  - `getService(id: number): Service | undefined`
  - `createService(input: Omit<Service, 'id'>): Service`
  - `updateService(id: number, input: Partial<Omit<Service, 'id'>>): Service`
  - `deactivateService(id: number): void`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/services.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-services.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('services data layer', () => {
  it('creates a service and lists it', async () => {
    const { createService, listServices } = await import('../../lib/services')
    createService({
      name: 'Brow Shape',
      category: 'brow',
      description: 'Precision waxing.',
      pricePence: 1800,
      durationMinutes: 15,
      active: true,
    })
    const services = listServices()
    expect(services).toHaveLength(1)
    expect(services[0].name).toBe('Brow Shape')
  })

  it('deactivateService hides it from activeOnly listing but keeps it in full listing', async () => {
    const { createService, deactivateService, listServices } = await import('../../lib/services')
    const s = createService({
      name: 'Back Exfoliation',
      category: 'facial',
      description: 'Deep cleansing back treatment.',
      pricePence: 4500,
      durationMinutes: 35,
      active: true,
    })
    deactivateService(s.id)
    expect(listServices({ activeOnly: true })).toHaveLength(0)
    expect(listServices({ activeOnly: false })).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/services.test.ts`
Expected: FAIL (`lib/services.ts` does not exist)

- [ ] **Step 3: Implement `lib/services.ts`**

```typescript
// lib/services.ts
import { getDb } from './db'

export type Service = {
  id: number
  name: string
  category: 'facial' | 'brow'
  description: string
  pricePence: number
  durationMinutes: number
  active: boolean
}

type ServiceRow = {
  id: number
  name: string
  category: 'facial' | 'brow'
  description: string
  price_pence: number
  duration_minutes: number
  active: number
}

function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    pricePence: row.price_pence,
    durationMinutes: row.duration_minutes,
    active: row.active === 1,
  }
}

export function listServices(opts: { activeOnly?: boolean } = {}): Service[] {
  const db = getDb()
  const rows = opts.activeOnly
    ? db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY category, price_pence').all()
    : db.prepare('SELECT * FROM services ORDER BY category, price_pence').all()
  return (rows as ServiceRow[]).map(rowToService)
}

export function getService(id: number): Service | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id) as ServiceRow | undefined
  return row ? rowToService(row) : undefined
}

export function createService(input: Omit<Service, 'id'>): Service {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO services (name, category, description, price_pence, duration_minutes, active)
       VALUES (@name, @category, @description, @pricePence, @durationMinutes, @active)`
    )
    .run({ ...input, active: input.active ? 1 : 0 })
  return getService(result.lastInsertRowid as number)!
}

export function updateService(id: number, input: Partial<Omit<Service, 'id'>>): Service {
  const existing = getService(id)
  if (!existing) throw new Error(`Service ${id} not found`)
  const merged = { ...existing, ...input }
  const db = getDb()
  db.prepare(
    `UPDATE services SET name = @name, category = @category, description = @description,
     price_pence = @pricePence, duration_minutes = @durationMinutes, active = @active WHERE id = @id`
  ).run({ ...merged, active: merged.active ? 1 : 0 })
  return getService(id)!
}

export function deactivateService(id: number): void {
  updateService(id, { active: false })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/services.test.ts`
Expected: PASS

- [ ] **Step 5: Write the seed script with the real treatment menu**

```typescript
// scripts/seed.ts
import { createService, listServices } from '../lib/services'

const treatments: Array<Parameters<typeof createService>[0]> = [
  { name: 'HydraDermabrasion', category: 'facial', pricePence: 14000, durationMinutes: 70, active: true,
    description: 'Using advanced technology, this treatment gently resurfaces, deeply cleanses, and infuses nourishment deep into your skin — all in one soothing session, finished with an anti-aging serum infusion. Ideal for fine lines, dullness, dehydration, congested pores, and sun-damaged or uneven texture.' },
  { name: 'Botanical Skin Lift Facial', category: 'facial', pricePence: 16500, durationMinutes: 90, active: true,
    description: 'Non-surgical lifting combining advanced technology with facial massage, infused with a Korean lift serum. Lifts, sculpts, firms, and defines contours for a naturally refreshed, youthful glow — ideal for mature, sagging, tired or dry skin, and loss of firmness.' },
  { name: 'Pro Hydra-Glow Facial', category: 'facial', pricePence: 18500, durationMinutes: 90, active: true,
    description: 'Our most comprehensive facial: custom booster serums, LED light therapy, lymphatic drainage, and a Salmon DNA serum for deep repair, brightening, and de-puffing. Ideal for dull, sun-damaged, tired, uneven texture or mature skin.' },
  { name: 'Dermaplaning Glow Facial', category: 'facial', pricePence: 9000, durationMinutes: 60, active: true,
    description: 'Gently removes dead skin and fine hairs, instantly smoothing texture and helping products absorb more deeply for flawless-looking skin. Suitable for all skin types except active breakouts.' },
  { name: 'Classic Cleanse & Glow Facial', category: 'facial', pricePence: 7500, durationMinutes: 60, active: true,
    description: 'A gentle cleanse, exfoliation, massage and hydration — perfect for maintenance and balanced, fresh, healthy-looking skin. Great for normal, balanced or sensitive skin and first-time clients.' },
  { name: 'Deep Purifying Facial', category: 'facial', pricePence: 11000, durationMinutes: 60, active: true,
    description: 'Targets clogged pores, excess oil and impurities, balancing congested skin gently and effectively. Ideal for oily, combination, congested or blemish-prone skin with enlarged pores, blackheads and whiteheads.' },
  { name: 'Back Exfoliation', category: 'facial', pricePence: 4500, durationMinutes: 35, active: true,
    description: 'A deep-cleansing back treatment with exfoliation to remove dead skin cells and smooth and refresh the skin, including cleanse, exfoliation and hydration.' },
  { name: 'Brow Shape', category: 'brow', pricePence: 1800, durationMinutes: 15, active: true,
    description: 'Expertly shapes your brows using precision waxing for a clean, defined and lifted look.' },
  { name: 'Brow Tinting', category: 'brow', pricePence: 1800, durationMinutes: 15, active: true,
    description: 'Adds colour and depth to your brows with a custom tint for a natural yet fuller appearance.' },
  { name: 'Brow Tinting & Shape', category: 'brow', pricePence: 3000, durationMinutes: 20, active: true,
    description: 'Combines tinting and shaping to enhance, define and perfect your brows.' },
  { name: 'Brow Lamination', category: 'brow', pricePence: 6000, durationMinutes: 45, active: true,
    description: 'Smooths and lifts brow hairs into place for a fuller, fluffier and long-lasting finish.' },
  { name: 'Complete Brow Lamination', category: 'brow', pricePence: 7500, durationMinutes: 60, active: true,
    description: 'Lamination, tint, shaping and waxing — the ultimate all-in-one treatment for perfectly groomed brows. A patch test is required at least 24 hours before your appointment.' },
]

function main() {
  const existing = listServices()
  if (existing.length > 0) {
    console.log(`Services table already has ${existing.length} rows — skipping seed.`)
    return
  }
  for (const t of treatments) createService(t)
  console.log(`Seeded ${treatments.length} services.`)
}

main()
```

- [ ] **Step 6: Add seed script to `package.json`**

Add to `"scripts"`: `"seed": "tsx scripts/seed.ts"`. Install `tsx`: `npm install -D tsx`.

- [ ] **Step 7: Run the seed script against the real dev database and verify**

```bash
npm run seed
```
Expected output: `Seeded 12 services.`

- [ ] **Step 8: Commit**

```bash
git add lib/services.ts scripts/seed.ts tests/lib/services.test.ts package.json package-lock.json
git commit -m "Add services data layer and seed real treatment menu"
```

---

## Task 4: Availability + Booking Data Layer

**Files:**
- Create: `lib/availability.ts`, `lib/bookings.ts`, `tests/lib/bookings.test.ts`

**Interfaces:**
- Consumes: `getDb()` from `lib/db.ts`, `getService(id)` from `lib/services.ts`.
- Produces:
  - `WORKING_HOURS: Record<number, { start: string; end: string } | null>` — keyed by JS `Date.getDay()` (0=Sun..6=Sat); `null` means closed. Default: closed Sunday & Monday, `09:00`–`17:30` Tue–Sat.
  - `generateSlots(date: string, durationMinutes: number): string[]` — returns `"HH:MM"` slot start times spaced 30 minutes apart that fit within working hours for that weekday.
  - `isSlotBlocked(date: string, time: string): boolean` — true if the whole day or that exact time is in `blocked_slots`.
  - `getAvailableSlots(serviceId: number, date: string): string[]` — `generateSlots()` minus already-booked times (from `bookings` where status != 'cancelled') minus blocked slots.
  - `type Booking = { id: number; serviceId: number; clientName: string; clientEmail: string; clientPhone: string; date: string; time: string; status: 'pending' | 'confirmed' | 'cancelled'; createdAt: string }`
  - `createBooking(input: Omit<Booking, 'id' | 'status' | 'createdAt'>): { ok: true; booking: Booking } | { ok: false; error: 'slot_unavailable' }`
  - `listBookings(): Booking[]`
  - `updateBookingStatus(id: number, status: Booking['status']): Booking`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/lib/bookings.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-bookings.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('booking flow', () => {
  it('creates a booking for an available slot', async () => {
    const { createService } = await import('../../lib/services')
    const { createBooking } = await import('../../lib/bookings')
    const service = createService({
      name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
    })
    const result = createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: '2026-09-15', time: '10:00',
    })
    expect(result.ok).toBe(true)
  })

  it('rejects a booking for an already-taken slot', async () => {
    const { createService } = await import('../../lib/services')
    const { createBooking } = await import('../../lib/bookings')
    const service = createService({
      name: 'Brow Shape', category: 'brow', description: 'x', pricePence: 1800, durationMinutes: 15, active: true,
    })
    const first = createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: '2026-09-15', time: '10:00',
    })
    expect(first.ok).toBe(true)

    const second = createBooking({
      serviceId: service.id, clientName: 'Sam Smith', clientEmail: 'sam@example.com',
      clientPhone: '07111111111', date: '2026-09-15', time: '10:00',
    })
    expect(second.ok).toBe(false)
    if (!second.ok) expect(second.error).toBe('slot_unavailable')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/bookings.test.ts`
Expected: FAIL (`lib/bookings.ts` does not exist)

- [ ] **Step 3: Implement `lib/availability.ts`**

```typescript
// lib/availability.ts
import { getDb } from './db'

export const WORKING_HOURS: Record<number, { start: string; end: string } | null> = {
  0: null, // Sunday closed
  1: null, // Monday closed
  2: { start: '09:00', end: '17:30' },
  3: { start: '09:00', end: '17:30' },
  4: { start: '09:00', end: '17:30' },
  5: { start: '09:00', end: '17:30' },
  6: { start: '09:00', end: '17:30' },
}

const SLOT_STEP_MINUTES = 30

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export function generateSlots(date: string, durationMinutes: number): string[] {
  const weekday = new Date(`${date}T00:00:00`).getDay()
  const hours = WORKING_HOURS[weekday]
  if (!hours) return []

  const start = toMinutes(hours.start)
  const end = toMinutes(hours.end)
  const slots: string[] = []
  for (let t = start; t + durationMinutes <= end; t += SLOT_STEP_MINUTES) {
    slots.push(toHHMM(t))
  }
  return slots
}

export function isSlotBlocked(date: string, time: string): boolean {
  const db = getDb()
  const wholeDay = db.prepare('SELECT 1 FROM blocked_slots WHERE date = ? AND time IS NULL').get(date)
  if (wholeDay) return true
  const exact = db.prepare('SELECT 1 FROM blocked_slots WHERE date = ? AND time = ?').get(date, time)
  return Boolean(exact)
}
```

- [ ] **Step 4: Implement `lib/bookings.ts`**

```typescript
// lib/bookings.ts
import { getDb } from './db'
import { getService } from './services'
import { generateSlots, isSlotBlocked } from './availability'

export type Booking = {
  id: number
  serviceId: number
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

type BookingRow = {
  id: number
  service_id: number
  client_name: string
  client_email: string
  client_phone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    serviceId: row.service_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    date: row.date,
    time: row.time,
    status: row.status,
    createdAt: row.created_at,
  }
}

export function getAvailableSlots(serviceId: number, date: string): string[] {
  const service = getService(serviceId)
  if (!service) return []
  const db = getDb()
  const taken = new Set(
    (db
      .prepare("SELECT time FROM bookings WHERE date = ? AND status != 'cancelled'")
      .all(date) as { time: string }[])
      .map((r) => r.time)
  )
  return generateSlots(date, service.durationMinutes).filter(
    (slot) => !taken.has(slot) && !isSlotBlocked(date, slot)
  )
}

export function createBooking(
  input: Omit<Booking, 'id' | 'status' | 'createdAt'>
): { ok: true; booking: Booking } | { ok: false; error: 'slot_unavailable' } {
  const available = getAvailableSlots(input.serviceId, input.date)
  if (!available.includes(input.time)) {
    return { ok: false, error: 'slot_unavailable' }
  }

  const db = getDb()
  try {
    const result = db
      .prepare(
        `INSERT INTO bookings (service_id, client_name, client_email, client_phone, date, time)
         VALUES (@serviceId, @clientName, @clientEmail, @clientPhone, @date, @time)`
      )
      .run(input)
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid) as BookingRow
    return { ok: true, booking: rowToBooking(row) }
  } catch {
    // UNIQUE(date, time) constraint caught a race between the availability check and insert
    return { ok: false, error: 'slot_unavailable' }
  }
}

export function listBookings(): Booking[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM bookings ORDER BY date, time').all() as BookingRow[]
  return rows.map(rowToBooking)
}

export function updateBookingStatus(id: number, status: Booking['status']): Booking {
  const db = getDb()
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id)
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as BookingRow
  return rowToBooking(row)
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/lib/bookings.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/availability.ts lib/bookings.ts tests/lib/bookings.test.ts
git commit -m "Add availability slot generation and booking creation with double-booking prevention"
```

---

## Task 5: Admin Auth (Password + Session Cookie + Middleware)

**Files:**
- Create: `lib/auth.ts`, `scripts/hash-password.ts`, `tests/lib/auth.test.ts`, `middleware.ts`

**Interfaces:**
- Consumes: `process.env.ADMIN_PASSWORD_HASH`, `process.env.SESSION_SECRET`.
- Produces:
  - `verifyPassword(plain: string): Promise<boolean>`
  - `createSessionToken(): string` — `"<expiryEpochMs>.<hmacHex>"`
  - `verifySessionToken(token: string | undefined): boolean`
  - Cookie name constant: `SESSION_COOKIE_NAME = 'sabrina_admin_session'`
  - `middleware.ts` redirects unauthenticated requests to `/admin/dashboard` → `/admin`, and returns 401 JSON for unauthenticated `/api/admin/*` requests.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

beforeEach(() => {
  process.env.SESSION_SECRET = 'test-secret'
})

describe('auth', () => {
  it('verifyPassword returns true for the correct password', async () => {
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-horse', 10)
    const { verifyPassword } = await import('../../lib/auth')
    expect(await verifyPassword('correct-horse')).toBe(true)
    expect(await verifyPassword('wrong')).toBe(false)
  })

  it('createSessionToken produces a token verifySessionToken accepts, and rejects a tampered token', async () => {
    const { createSessionToken, verifySessionToken } = await import('../../lib/auth')
    const token = createSessionToken()
    expect(verifySessionToken(token)).toBe(true)
    expect(verifySessionToken(token + 'x')).toBe(false)
    expect(verifySessionToken(undefined)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/auth.test.ts`
Expected: FAIL (`lib/auth.ts` does not exist)

- [ ] **Step 3: Implement `lib/auth.ts`**

```typescript
// lib/auth.ts
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'

export const SESSION_COOKIE_NAME = 'sabrina_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

export async function verifyPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) return false
  return bcrypt.compare(plain, hash)
}

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET || ''
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function createSessionToken(): string {
  const expiry = Date.now() + SESSION_TTL_MS
  const payload = String(expiry)
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  if (sign(payload) !== signature) return false
  const expiry = Number(payload)
  if (Number.isNaN(expiry) || Date.now() > expiry) return false
  return true
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/auth.test.ts`
Expected: PASS

- [ ] **Step 5: Write `scripts/hash-password.ts`** (developer utility to generate `ADMIN_PASSWORD_HASH` for `.env.local`)

```typescript
// scripts/hash-password.ts
import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password) {
  console.error('Usage: npm run hash-password -- <password>')
  process.exit(1)
}
console.log(bcrypt.hashSync(password, 10))
```

Add to `package.json` scripts: `"hash-password": "tsx scripts/hash-password.ts"`.

- [ ] **Step 6: Implement `middleware.ts`**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const authed = verifySessionToken(token)

  if (!authed) {
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/api/admin/:path*'],
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/auth.ts scripts/hash-password.ts tests/lib/auth.test.ts middleware.ts package.json
git commit -m "Add admin password auth, signed session cookie, and route protection middleware"
```

---

## Task 6: Source Professional Images

**Files:**
- Create: `public/images/hero.jpg`, `public/images/facials.jpg`, `public/images/brows.jpg`, `public/images/about.jpg`

**Interfaces:**
- Produces: four real, high-resolution, professionally shot photographs matching each section's subject (spa/skincare hero shot, facial-treatment close-up, brow-treatment close-up, calm spa-interior/about shot). Sourced from Unsplash under the Unsplash License (free for commercial and personal use, no permission or attribution required, per unsplash.com/license), hotlinked from `images.unsplash.com` and downloaded locally so the site has no runtime dependency on an external image host.

- [ ] **Step 1: Find and download the hero image**

Search Unsplash for a professional spa/facial-treatment hero photo (e.g. via `https://unsplash.com/s/photos/facial-spa-treatment`), identify a real photo's direct CDN URL (`https://images.unsplash.com/photo-<id>?...`), and download it:

```bash
curl -sL "https://images.unsplash.com/photo-<chosen-id>?q=80&w=1920&auto=format&fit=crop" -o public/images/hero.jpg
file public/images/hero.jpg
```
Expected `file` output: `JPEG image data` with reasonable dimensions (≥1600px wide). If the URL 404s or returns HTML instead of JPEG, pick a different photo ID and retry.

- [ ] **Step 2: Download the facials-category image**

Same process, searching `https://unsplash.com/s/photos/facial-skincare-treatment`, saving to `public/images/facials.jpg`.

- [ ] **Step 3: Download the brows-category image**

Same process, searching `https://unsplash.com/s/photos/eyebrow-treatment`, saving to `public/images/brows.jpg`.

- [ ] **Step 4: Download the about/spa-interior image**

Same process, searching `https://unsplash.com/s/photos/spa-interior-calm`, saving to `public/images/about.jpg`.

- [ ] **Step 5: Verify all four images are valid, reasonably large JPEGs**

```bash
for f in hero facials brows about; do
  echo "$f:"; file "public/images/$f.jpg"; ls -lh "public/images/$f.jpg"
done
```
Expected: all four report `JPEG image data`, each file size roughly 100KB–2MB (reject anything under ~20KB — likely an error page, not a real photo).

- [ ] **Step 6: Commit**

```bash
git add public/images
git commit -m "Add professional stock photography for hero, facials, brows, and about sections"
```

---

## Task 7: Design System — Tailwind Theme, Layout, Header, Footer, Logo

**Files:**
- Modify: `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`
- Create: `components/Header.tsx`, `components/Footer.tsx`, `components/Logo.tsx`

**Interfaces:**
- Produces: Tailwind theme extension with the "modern luxury spa" palette and font families; `<Logo />` (SVG wordmark, accepts `className?: string`); `<Header />` and `<Footer />` used by the root layout on every page. Footer includes the verbatim contact details and social links from the Global Constraints section.

- [ ] **Step 1: Extend `tailwind.config.ts` with the palette and fonts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F8F5F0',
        sage: '#A9B4A0',
        blush: '#E8CFC7',
        charcoal: '#2B2926',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Load Google Fonts in `app/layout.tsx` and wire Header/Footer**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-serif' })
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Sabrina Beauty — Skincare, Facials & Spa Treatments',
  description: 'Your sanctuary for luxurious, results-focused facial treatments designed to enhance your natural beauty.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} font-sans bg-cream text-charcoal`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Implement `components/Logo.tsx`**

```tsx
// components/Logo.tsx
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-serif text-2xl tracking-wide text-charcoal ${className}`}>
      Sabrina <span className="italic text-sage">Beauty</span>
    </span>
  )
}
```

- [ ] **Step 4: Implement `components/Header.tsx`**

```tsx
// components/Header.tsx
import Link from 'next/link'
import Logo from './Logo'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/book', label: 'Book Online' },
]

export default function Header() {
  return (
    <header className="border-b border-sage/30 bg-cream/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/"><Logo /></Link>
        <nav className="flex gap-8 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-sage transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Implement `components/Footer.tsx`**

```tsx
// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <h3 className="font-serif text-xl mb-3">Sabrina Beauty</h3>
          <p className="text-cream/70">Your sanctuary for luxurious, results-focused facial treatments.</p>
        </div>
        <div>
          <h4 className="font-medium mb-3">Get in touch</h4>
          <ul className="space-y-2 text-cream/70">
            <li><a href="mailto:info@s1botanicals.co.uk" className="hover:text-blush">info@s1botanicals.co.uk</a></li>
            <li><a href="https://api.whatsapp.com/send?phone=447494700707" className="hover:text-blush">WhatsApp: +44 7494 700707</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Follow</h4>
          <ul className="space-y-2 text-cream/70">
            <li><a href="https://instagram.com/Sabrinabeauty.studioo" className="hover:text-blush">Instagram</a></li>
            <li><a href="https://tiktok.com/@botanicalessence7" className="hover:text-blush">TikTok</a></li>
            <li><a href="https://facebook.com/Sabrinabeauty7" className="hover:text-blush">Facebook</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        S1 Botanicals Ltd · Company No. 17182720
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: Verify build compiles**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.ts app/layout.tsx components/Logo.tsx components/Header.tsx components/Footer.tsx
git commit -m "Add design system: palette, fonts, logo wordmark, header, footer"
```

---

## Task 8: Home Page

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `public/images/hero.jpg` (Task 6), `<Logo />`/`Header`/`Footer` (already in root layout, not re-imported here).

- [ ] **Step 1: Implement `app/page.tsx`**

```tsx
// app/page.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <section className="relative h-[80vh] min-h-[560px] flex items-center">
        <Image
          src="/images/hero.jpg"
          alt="Client receiving a relaxing facial treatment at Sabrina Beauty"
          fill
          priority
          className="object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-charcoal/30" />
        <div className="relative max-w-3xl mx-auto text-center text-cream px-6">
          <h1 className="font-serif text-5xl sm:text-6xl mb-6">Welcome to Sabrina Beauty</h1>
          <p className="text-lg sm:text-xl mb-8">
            Your sanctuary for luxurious, results-focused facial treatments designed to enhance your natural beauty.
          </p>
          <Link
            href="/book"
            className="inline-block bg-blush text-charcoal px-8 py-3 rounded-xl2 font-medium hover:bg-blush/90 transition-colors"
          >
            Book Your Treatment
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl mb-6">Where Glowing Skin Begins</h2>
        <p className="text-charcoal/80 leading-relaxed">
          At Sabrina Beauty, we combine carefully selected vegan botanicals with deep hydration and expert skincare
          techniques to support healthy, radiant-looking skin. Each treatment is thoughtfully tailored to your
          individual skin needs, creating a relaxing experience while helping you achieve a fresh, natural glow.
        </p>
        <p className="mt-6 text-sage font-medium tracking-wide uppercase text-sm">
          Vegan &bull; Cruelty-Free &bull; Professional Care
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 text-center">
        <Link href="/services" className="underline underline-offset-4 hover:text-sage">
          Explore our full treatment menu &rarr;
        </Link>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev -- --port 4173 &` then `sleep 3 && curl -s http://localhost:4173 | grep -o "Welcome to Sabrina Beauty"` then `kill %1`
Expected output: `Welcome to Sabrina Beauty`

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "Build Home page with hero image and brand story"
```

---

## Task 9: Services Page

**Files:**
- Create: `components/ServiceCard.tsx`, `app/services/page.tsx`
- Test: `tests/api/services-page.test.ts` (or manual curl check, see Step 3)

**Interfaces:**
- Consumes: `listServices({ activeOnly: true })` from `lib/services.ts`.
- Produces: `<ServiceCard service={Service} />`.

- [ ] **Step 1: Implement `components/ServiceCard.tsx`**

```tsx
// components/ServiceCard.tsx
import type { Service } from '@/lib/services'

export default function ServiceCard({ service }: { service: Service }) {
  const price = (service.pricePence / 100).toFixed(0)
  return (
    <div className="border border-sage/30 rounded-xl2 p-6 bg-white/60">
      <div className="flex justify-between items-baseline mb-2">
        <h3 className="font-serif text-xl">{service.name}</h3>
        <span className="font-medium text-sage">&pound;{price}</span>
      </div>
      <p className="text-sm text-charcoal/60 mb-3">{service.durationMinutes} minutes</p>
      <p className="text-charcoal/80 leading-relaxed">{service.description}</p>
    </div>
  )
}
```

- [ ] **Step 2: Implement `app/services/page.tsx`**

```tsx
// app/services/page.tsx
import Image from 'next/image'
import { listServices } from '@/lib/services'
import ServiceCard from '@/components/ServiceCard'

export default function ServicesPage() {
  const services = listServices({ activeOnly: true })
  const facials = services.filter((s) => s.category === 'facial')
  const brows = services.filter((s) => s.category === 'brow')

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-16">Our Treatment Menu</h1>

      <section className="mb-16">
        <div className="relative h-56 rounded-xl2 overflow-hidden mb-8">
          <Image src="/images/facials.jpg" alt="Professional facial treatment in progress" fill className="object-cover" />
        </div>
        <h2 className="font-serif text-2xl mb-6">Facial Treatments</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {facials.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      <section>
        <div className="relative h-56 rounded-xl2 overflow-hidden mb-8">
          <Image src="/images/brows.jpg" alt="Professional brow shaping and tinting treatment" fill className="object-cover" />
        </div>
        <h2 className="font-serif text-2xl mb-6">Brow Treatments</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {brows.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verify all 12 services render**

Run: `npm run dev -- --port 4173 & sleep 3 && curl -s http://localhost:4173/services | grep -c "font-serif text-xl"; kill %1`
Expected: `12`

- [ ] **Step 4: Commit**

```bash
git add components/ServiceCard.tsx app/services/page.tsx
git commit -m "Build Services page listing all facial and brow treatments"
```

---

## Task 10: About Page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Implement `app/about/page.tsx`**

```tsx
// app/about/page.tsx
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-12">Our Story, Your Glow</h1>
      <div className="relative h-72 rounded-xl2 overflow-hidden mb-12">
        <Image src="/images/about.jpg" alt="Calm, minimal spa treatment room" fill className="object-cover" />
      </div>
      <div className="space-y-6 text-charcoal/80 leading-relaxed text-lg">
        <p>
          Sabrina Beauty was born from a passion for skincare and a belief that beautiful skin begins with
          thoughtful, personalised care.
        </p>
        <p>
          Our approach combines carefully selected botanical ingredients with professional skincare techniques to
          nourish, refresh and enhance your skin&rsquo;s natural radiance.
        </p>
        <p>
          Every treatment is designed with care, creating a relaxing experience that leaves your skin feeling
          nourished, renewed, and glowing from within &mdash; and you feeling calm, cared for, and confident.
        </p>
        <p className="text-sage font-medium tracking-wide uppercase text-sm pt-4">
          Vegan &bull; Cruelty-Free &bull; Professional Care
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev -- --port 4173 & sleep 3 && curl -s http://localhost:4173/about | grep -o "Our Story, Your Glow"; kill %1`
Expected: `Our Story, Your Glow`

- [ ] **Step 3: Commit**

```bash
git add app/about/page.tsx
git commit -m "Build About page with completed brand story copy"
```

---

## Task 11: Booking API Routes

**Files:**
- Create: `app/api/services/route.ts`, `app/api/availability/route.ts`, `app/api/bookings/route.ts`
- Test: `tests/api/booking-flow.test.ts`

**Interfaces:**
- Consumes: `listServices`, `getAvailableSlots`, `createBooking`.
- Produces: `GET /api/services` → `Service[]`; `GET /api/availability?serviceId=&date=` → `string[]`; `POST /api/bookings` → `{ ok: true, booking } | { ok: false, error }`.

- [ ] **Step 1: Implement `app/api/services/route.ts`**

```typescript
// app/api/services/route.ts
import { NextResponse } from 'next/server'
import { listServices } from '@/lib/services'

export async function GET() {
  return NextResponse.json(listServices({ activeOnly: true }))
}
```

- [ ] **Step 2: Implement `app/api/availability/route.ts`**

```typescript
// app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/bookings'

export async function GET(request: NextRequest) {
  const serviceId = Number(request.nextUrl.searchParams.get('serviceId'))
  const date = request.nextUrl.searchParams.get('date')
  if (!serviceId || !date) {
    return NextResponse.json({ error: 'serviceId and date are required' }, { status: 400 })
  }
  return NextResponse.json(getAvailableSlots(serviceId, date))
}
```

- [ ] **Step 3: Implement `app/api/bookings/route.ts`**

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createBooking } from '@/lib/bookings'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { serviceId, clientName, clientEmail, clientPhone, date, time } = body

  if (!serviceId || !clientName || !clientEmail || !clientPhone || !date || !time) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const result = createBooking({ serviceId, clientName, clientEmail, clientPhone, date, time })
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 })
  }
  return NextResponse.json(result, { status: 201 })
}
```

- [ ] **Step 4: Write an integration test exercising the whole flow through the data layer**

```typescript
// tests/api/booking-flow.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-booking-flow.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('end-to-end booking flow', () => {
  it('lists services, finds an available slot, books it, and the slot disappears from availability', async () => {
    const { createService } = await import('../../lib/services')
    const { getAvailableSlots, createBooking } = await import('../../lib/bookings')

    const service = createService({
      name: 'Classic Cleanse & Glow Facial', category: 'facial', description: 'x',
      pricePence: 7500, durationMinutes: 60, active: true,
    })

    const tuesday = '2026-09-15' // confirmed Tuesday
    const slotsBefore = getAvailableSlots(service.id, tuesday)
    expect(slotsBefore.length).toBeGreaterThan(0)

    const chosen = slotsBefore[0]
    const result = createBooking({
      serviceId: service.id, clientName: 'Jo Bloggs', clientEmail: 'jo@example.com',
      clientPhone: '07000000000', date: tuesday, time: chosen,
    })
    expect(result.ok).toBe(true)

    const slotsAfter = getAvailableSlots(service.id, tuesday)
    expect(slotsAfter).not.toContain(chosen)
  })
})
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/api/booking-flow.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/api/services/route.ts app/api/availability/route.ts app/api/bookings/route.ts tests/api/booking-flow.test.ts
git commit -m "Add public services, availability, and booking API routes"
```

---

## Task 12: Booking Page UI

**Files:**
- Create: `components/BookingForm.tsx`, `app/book/page.tsx`

**Interfaces:**
- Consumes: `GET /api/services`, `GET /api/availability`, `POST /api/bookings` (Task 11).

- [ ] **Step 1: Implement `components/BookingForm.tsx`**

```tsx
// components/BookingForm.tsx
'use client'

import { useEffect, useState } from 'react'
import type { Service } from '@/lib/services'

export default function BookingForm() {
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState<number | ''>('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [time, setTime] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmed' | 'error'>('idle')

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then(setServices)
  }, [])

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([])
      return
    }
    fetch(`/api/availability?serviceId=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then(setSlots)
  }, [serviceId, date])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, date, time, clientName: form.name, clientEmail: form.email, clientPhone: form.phone }),
    })
    setStatus(res.ok ? 'confirmed' : 'error')
  }

  if (status === 'confirmed') {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl mb-4">You&rsquo;re booked!</h2>
        <p className="text-charcoal/70">We look forward to seeing you. A member of the team may follow up by phone or email to confirm.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div>
        <label className="block mb-2 text-sm font-medium">Treatment</label>
        <select
          required
          value={serviceId}
          onChange={(e) => setServiceId(Number(e.target.value))}
          className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white"
        >
          <option value="" disabled>Choose a treatment&hellip;</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} &mdash; &pound;{(s.pricePence / 100).toFixed(0)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Date</label>
        <input
          required
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setTime('') }}
          className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white"
        />
      </div>

      {date && (
        <div>
          <label className="block mb-2 text-sm font-medium">Time</label>
          {slots.length === 0 ? (
            <p className="text-sm text-charcoal/60">No availability on this date &mdash; please try another.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setTime(s)}
                  className={`px-3 py-2 rounded-xl2 border text-sm ${time === s ? 'bg-sage text-white border-sage' : 'border-sage/40 hover:bg-sage/10'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium">Your name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white" />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Email</label>
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white" />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Phone</label>
        <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white" />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">That slot was just taken &mdash; please choose another time.</p>
      )}

      <button
        type="submit"
        disabled={!serviceId || !date || !time || status === 'submitting'}
        className="w-full bg-blush text-charcoal py-3 rounded-xl2 font-medium disabled:opacity-40"
      >
        {status === 'submitting' ? 'Booking…' : 'Confirm Booking'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Implement `app/book/page.tsx`**

```tsx
// app/book/page.tsx
import BookingForm from '@/components/BookingForm'

export default function BookPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-4">Book Your Pampering Facial Online</h1>
      <p className="text-center text-charcoal/70 mb-12">
        Choose your treatment, pick a convenient date and time, and leave the rest to us.
      </p>
      <BookingForm />
    </div>
  )
}
```

- [ ] **Step 3: Verify the page renders and the API wiring works end-to-end in the browser**

Run: `npm run seed` (if not already seeded against the dev DB), then `npm run dev -- --port 4173 & sleep 3 && curl -s http://localhost:4173/book | grep -o "Book Your Pampering Facial Online"; kill %1`
Expected: `Book Your Pampering Facial Online`

- [ ] **Step 4: Commit**

```bash
git add components/BookingForm.tsx app/book/page.tsx
git commit -m "Build booking page with live availability and confirmation flow"
```

---

## Task 13: Admin Auth Routes + Login Page

**Files:**
- Create: `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts`, `app/admin/page.tsx`

**Interfaces:**
- Consumes: `verifyPassword`, `createSessionToken`, `SESSION_COOKIE_NAME` from `lib/auth.ts`. **Note: `createSessionToken()` and `verifySessionToken()` are `async` (they use the Web Crypto API so `lib/auth.ts` works in both the Node runtime and Next.js Edge middleware) — the plan snippets below already reflect this; make sure to `await createSessionToken()`.**

- [ ] **Step 1: Implement `app/api/admin/login/route.ts`**

```typescript
// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const valid = await verifyPassword(password ?? '')
  if (!valid) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return res
}
```

- [ ] **Step 2: Implement `app/api/admin/logout/route.ts`**

```typescript
// app/api/admin/logout/route.ts
import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE_NAME)
  return res
}
```

- [ ] **Step 3: Implement `app/admin/page.tsx`**

```tsx
// app/admin/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(false)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError(true)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-center mb-8">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-sage/40 rounded-xl2 px-4 py-3"
        />
        {error && <p className="text-sm text-red-600">Incorrect password.</p>}
        <button type="submit" className="w-full bg-charcoal text-cream py-3 rounded-xl2 font-medium">
          Log in
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Verify unauthenticated access to the dashboard redirects**

Run: `npm run dev -- --port 4173 & sleep 3 && curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/admin/dashboard; kill %1`
Expected: `307` (Next.js redirect status) — confirms `middleware.ts` from Task 5 is blocking unauthenticated access.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/login/route.ts app/api/admin/logout/route.ts app/admin/page.tsx
git commit -m "Add admin login/logout routes and login page"
```

---

## Task 14: Admin Dashboard — Bookings, Services, Blocked Dates

**Files:**
- Create: `app/api/admin/bookings/route.ts`, `app/api/admin/bookings/[id]/route.ts`, `app/api/admin/services/route.ts`, `app/api/admin/services/[id]/route.ts`, `app/api/admin/blocked-slots/route.ts`, `app/admin/dashboard/page.tsx`

**Interfaces:**
- Consumes: `listBookings`, `updateBookingStatus` (`lib/bookings.ts`); `listServices`, `createService`, `updateService`, `deactivateService` (`lib/services.ts`); `getDb` for blocked-slot CRUD.
- All routes here are already protected by `middleware.ts` (Task 5) matching `/api/admin/*`.

- [ ] **Step 1: Implement `app/api/admin/bookings/route.ts`**

```typescript
// app/api/admin/bookings/route.ts
import { NextResponse } from 'next/server'
import { listBookings } from '@/lib/bookings'

export async function GET() {
  return NextResponse.json(listBookings())
}
```

- [ ] **Step 2: Implement `app/api/admin/bookings/[id]/route.ts`**

```typescript
// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateBookingStatus } from '@/lib/bookings'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await request.json()
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
  }
  const booking = updateBookingStatus(Number(params.id), status)
  return NextResponse.json(booking)
}
```

- [ ] **Step 3: Implement `app/api/admin/services/route.ts`**

```typescript
// app/api/admin/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { listServices, createService } from '@/lib/services'

export async function GET() {
  return NextResponse.json(listServices())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const service = createService(body)
  return NextResponse.json(service, { status: 201 })
}
```

- [ ] **Step 4: Implement `app/api/admin/services/[id]/route.ts`**

```typescript
// app/api/admin/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateService, deactivateService } from '@/lib/services'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const service = updateService(Number(params.id), body)
  return NextResponse.json(service)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  deactivateService(Number(params.id))
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Implement `app/api/admin/blocked-slots/route.ts`**

```typescript
// app/api/admin/blocked-slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  return NextResponse.json(db.prepare('SELECT * FROM blocked_slots ORDER BY date').all())
}

export async function POST(request: NextRequest) {
  const { date, time } = await request.json()
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO blocked_slots (date, time) VALUES (?, ?)').run(date, time ?? null)
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const id = Number(request.nextUrl.searchParams.get('id'))
  const db = getDb()
  db.prepare('DELETE FROM blocked_slots WHERE id = ?').run(id)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 6: Implement `app/admin/dashboard/page.tsx`** (client component, fetches all three admin resources)

```tsx
// app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import type { Booking } from '@/lib/bookings'
import type { Service } from '@/lib/services'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])

  function refresh() {
    fetch('/api/admin/bookings').then((r) => r.json()).then(setBookings)
    fetch('/api/admin/services').then((r) => r.json()).then(setServices)
  }

  useEffect(refresh, [])

  async function setStatus(id: number, status: Booking['status']) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    refresh()
  }

  async function toggleActive(service: Service) {
    if (service.active) {
      await fetch(`/api/admin/services/${service.id}`, { method: 'DELETE' })
    } else {
      await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true }),
      })
    }
    refresh()
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl mb-10">Admin Dashboard</h1>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">Bookings</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-sage/30">
              <th className="py-2">Date</th><th>Time</th><th>Client</th><th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-sage/10">
                <td className="py-2">{b.date}</td>
                <td>{b.time}</td>
                <td>{b.clientName} &middot; {b.clientEmail} &middot; {b.clientPhone}</td>
                <td>{b.status}</td>
                <td className="space-x-2">
                  <button onClick={() => setStatus(b.id, 'confirmed')} className="text-sage underline">Confirm</button>
                  <button onClick={() => setStatus(b.id, 'cancelled')} className="text-red-500 underline">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">Services</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-sage/30">
              <th className="py-2">Name</th><th>Price</th><th>Active</th><th />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-sage/10">
                <td className="py-2">{s.name}</td>
                <td>&pound;{(s.pricePence / 100).toFixed(0)}</td>
                <td>{s.active ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleActive(s)} className="text-sage underline">
                    {s.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
```

- [ ] **Step 7: Write and run a test proving deactivating a service removes it from the public listing**

```typescript
// tests/lib/admin-services.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-admin-services.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('admin service management reflects on public listing', () => {
  it('deactivating a service removes it from the active-only public listing', async () => {
    const { createService, deactivateService, listServices } = await import('../../lib/services')
    const s = createService({
      name: 'Dermaplaning Glow Facial', category: 'facial', description: 'x',
      pricePence: 9000, durationMinutes: 60, active: true,
    })
    expect(listServices({ activeOnly: true }).map((x) => x.id)).toContain(s.id)
    deactivateService(s.id)
    expect(listServices({ activeOnly: true }).map((x) => x.id)).not.toContain(s.id)
  })
})
```

Run: `npx vitest run tests/lib/admin-services.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/api/admin app/admin/dashboard/page.tsx tests/lib/admin-services.test.ts
git commit -m "Add admin dashboard for managing bookings and services"
```

---

## Task 15: Contact Section + Final Full Test Suite + README

**Files:**
- Modify: `app/page.tsx` (add a contact CTA linking to footer details already present), `README.md` (create)

**Interfaces:**
- No new interfaces — this task verifies the whole system together and documents how to run it.

- [ ] **Step 1: Confirm contact details are reachable from every page**

Since `Footer` (Task 7) is in the root layout, contact details already appear on every page. Verify by running: `npm run dev -- --port 4173 & sleep 3 && curl -s http://localhost:4173/services | grep -o "info@s1botanicals.co.uk"; kill %1`
Expected: `info@s1botanicals.co.uk`

- [ ] **Step 2: Run the full test suite**

Run: `npx vitest run`
Expected: all test files pass (db, services, bookings, auth, booking-flow, admin-services).

- [ ] **Step 3: Run a full production build**

Run: `npm run build`
Expected: build succeeds with zero type errors.

- [ ] **Step 4: Write `README.md`**

```markdown
# Sabrina Beauty Website

Local, self-contained Next.js site for Sabrina Beauty (skincare, facials, spa treatments, and brow treatments).

## Setup

\`\`\`bash
npm install
cp .env.local.example .env.local
npm run hash-password -- "your-chosen-admin-password"
# paste the printed hash into .env.local as ADMIN_PASSWORD_HASH
# set SESSION_SECRET in .env.local to any long random string
npm run seed   # seeds the 12-item treatment menu into data/sabrina.db
npm run dev
\`\`\`

Visit http://localhost:3000. Admin dashboard: http://localhost:3000/admin.

## Testing

\`\`\`bash
npm test
\`\`\`

## Deploying later

This is a standard Next.js app — deployable to any Node-capable host (Vercel, Netlify, Render, etc.).
Swap `data/sabrina.db` (SQLite) for a hosted database if the target host requires it; the data-access
functions in `lib/services.ts` and `lib/bookings.ts` are the only places that would need updating.

## Known gaps (by design, deferred)

- No online payment / product sales.
- No automated email confirmations (booking shows an on-screen confirmation only).
- No physical address or opening hours shown — none exist yet for the business.
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Add README with setup instructions; verify full test suite and production build"
```

---

## Self-Review Notes

- **Spec coverage:** Home/Services/About/Book/Contact/Admin pages ✅ (Tasks 8–14); all 12 treatments with exact prices/durations ✅ (Task 3 seed); booking flow + double-booking prevention ✅ (Task 4, 11); admin password auth + route protection ✅ (Task 5, 13); modern-luxury-spa visual design + wordmark logo ✅ (Task 7); real professional images ✅ (Task 6); tests before done ✅ (every data-layer task ships with tests, Task 15 runs them all together); zero external paid services ✅ (SQLite + HMAC session, no Stripe/email provider); portability to a future host ✅ (README, Next.js standard structure).
- **Deferred items carried through correctly:** no payment routes exist anywhere in the file structure; no email-sending code exists; no address/hours fabricated in any copy.
