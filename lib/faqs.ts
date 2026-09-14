import { sql, ensureSchema } from './db'

export type Faq = {
  id: number
  question: string
  answer: string
  sortOrder: number
}

type FaqRow = {
  id: number
  question: string
  answer: string
  sort_order: number
}

function rowToFaq(row: FaqRow): Faq {
  return { id: row.id, question: row.question, answer: row.answer, sortOrder: row.sort_order }
}

export async function listFaqs(): Promise<Faq[]> {
  await ensureSchema()
  const { rows } = await sql<FaqRow>`SELECT * FROM faqs ORDER BY sort_order, id`
  return rows.map(rowToFaq)
}

export async function getFaq(id: number): Promise<Faq | undefined> {
  await ensureSchema()
  const { rows } = await sql<FaqRow>`SELECT * FROM faqs WHERE id = ${id}`
  return rows[0] ? rowToFaq(rows[0]) : undefined
}

export async function createFaq(input: Omit<Faq, 'id'>): Promise<Faq> {
  await ensureSchema()
  const { rows } = await sql<FaqRow>`
    INSERT INTO faqs (question, answer, sort_order) VALUES (${input.question}, ${input.answer}, ${input.sortOrder})
    RETURNING *
  `
  return rowToFaq(rows[0])
}

export async function updateFaq(id: number, input: Partial<Omit<Faq, 'id'>>): Promise<Faq> {
  const existing = await getFaq(id)
  if (!existing) throw new Error(`Faq ${id} not found`)
  const merged = { ...existing, ...input }
  const { rows } = await sql<FaqRow>`
    UPDATE faqs SET question = ${merged.question}, answer = ${merged.answer}, sort_order = ${merged.sortOrder}
    WHERE id = ${id}
    RETURNING *
  `
  return rowToFaq(rows[0])
}

export async function deleteFaq(id: number): Promise<void> {
  await ensureSchema()
  await sql`DELETE FROM faqs WHERE id = ${id}`
}
