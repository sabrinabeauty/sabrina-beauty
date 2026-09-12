import { getDb } from './db'

export type Testimonial = {
  id: number
  clientName: string
  quote: string
  active: boolean
}

type TestimonialRow = {
  id: number
  client_name: string
  quote: string
  active: number
}

function rowToTestimonial(row: TestimonialRow): Testimonial {
  return { id: row.id, clientName: row.client_name, quote: row.quote, active: row.active === 1 }
}

export function listTestimonials(opts: { activeOnly?: boolean } = {}): Testimonial[] {
  const db = getDb()
  const rows = opts.activeOnly
    ? db.prepare('SELECT * FROM testimonials WHERE active = 1 ORDER BY id DESC').all()
    : db.prepare('SELECT * FROM testimonials ORDER BY id DESC').all()
  return (rows as TestimonialRow[]).map(rowToTestimonial)
}

export function getTestimonial(id: number): Testimonial | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id) as TestimonialRow | undefined
  return row ? rowToTestimonial(row) : undefined
}

export function createTestimonial(input: Omit<Testimonial, 'id'>): Testimonial {
  const db = getDb()
  const result = db
    .prepare(
      'INSERT INTO testimonials (client_name, quote, active) VALUES (@clientName, @quote, @active)'
    )
    .run({ ...input, active: input.active ? 1 : 0 })
  return getTestimonial(result.lastInsertRowid as number)!
}

export function updateTestimonial(id: number, input: Partial<Omit<Testimonial, 'id'>>): Testimonial {
  const existing = getTestimonial(id)
  if (!existing) throw new Error(`Testimonial ${id} not found`)
  const merged = { ...existing, ...input }
  const db = getDb()
  db.prepare('UPDATE testimonials SET client_name = @clientName, quote = @quote, active = @active WHERE id = @id').run(
    { ...merged, active: merged.active ? 1 : 0 }
  )
  return getTestimonial(id)!
}

export function deactivateTestimonial(id: number): void {
  updateTestimonial(id, { active: false })
}

export function deleteTestimonial(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM testimonials WHERE id = ?').run(id)
}
