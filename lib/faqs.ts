import { getDb } from './db'

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

export function listFaqs(): Faq[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM faqs ORDER BY sort_order, id').all() as FaqRow[]
  return rows.map(rowToFaq)
}

export function getFaq(id: number): Faq | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM faqs WHERE id = ?').get(id) as FaqRow | undefined
  return row ? rowToFaq(row) : undefined
}

export function createFaq(input: Omit<Faq, 'id'>): Faq {
  const db = getDb()
  const result = db
    .prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (@question, @answer, @sortOrder)')
    .run(input)
  return getFaq(result.lastInsertRowid as number)!
}

export function updateFaq(id: number, input: Partial<Omit<Faq, 'id'>>): Faq {
  const existing = getFaq(id)
  if (!existing) throw new Error(`Faq ${id} not found`)
  const merged = { ...existing, ...input }
  const db = getDb()
  db.prepare('UPDATE faqs SET question = @question, answer = @answer, sort_order = @sortOrder WHERE id = @id').run(
    merged
  )
  return getFaq(id)!
}

export function deleteFaq(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM faqs WHERE id = ?').run(id)
}
