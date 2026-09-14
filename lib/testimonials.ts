import { sql, ensureSchema } from './db'

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
  active: boolean
}

function rowToTestimonial(row: TestimonialRow): Testimonial {
  return { id: row.id, clientName: row.client_name, quote: row.quote, active: row.active }
}

export async function listTestimonials(opts: { activeOnly?: boolean } = {}): Promise<Testimonial[]> {
  await ensureSchema()
  const { rows } = opts.activeOnly
    ? await sql<TestimonialRow>`SELECT * FROM testimonials WHERE active = true ORDER BY id DESC`
    : await sql<TestimonialRow>`SELECT * FROM testimonials ORDER BY id DESC`
  return rows.map(rowToTestimonial)
}

export async function getTestimonial(id: number): Promise<Testimonial | undefined> {
  await ensureSchema()
  const { rows } = await sql<TestimonialRow>`SELECT * FROM testimonials WHERE id = ${id}`
  return rows[0] ? rowToTestimonial(rows[0]) : undefined
}

export async function createTestimonial(input: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  await ensureSchema()
  const { rows } = await sql<TestimonialRow>`
    INSERT INTO testimonials (client_name, quote, active) VALUES (${input.clientName}, ${input.quote}, ${input.active})
    RETURNING *
  `
  return rowToTestimonial(rows[0])
}

export async function updateTestimonial(
  id: number,
  input: Partial<Omit<Testimonial, 'id'>>
): Promise<Testimonial> {
  const existing = await getTestimonial(id)
  if (!existing) throw new Error(`Testimonial ${id} not found`)
  const merged = { ...existing, ...input }
  const { rows } = await sql<TestimonialRow>`
    UPDATE testimonials SET client_name = ${merged.clientName}, quote = ${merged.quote}, active = ${merged.active}
    WHERE id = ${id}
    RETURNING *
  `
  return rowToTestimonial(rows[0])
}

export async function deactivateTestimonial(id: number): Promise<void> {
  await updateTestimonial(id, { active: false })
}

export async function deleteTestimonial(id: number): Promise<void> {
  await ensureSchema()
  await sql`DELETE FROM testimonials WHERE id = ${id}`
}
