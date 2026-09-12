import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-faqs.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('faqs data layer', () => {
  it('creates a faq and lists it', async () => {
    const { createFaq, listFaqs } = await import('../../lib/faqs')
    createFaq({ question: 'Do you take walk-ins?', answer: 'Booking ahead is recommended.', sortOrder: 0 })
    const faqs = listFaqs()
    expect(faqs).toHaveLength(1)
    expect(faqs[0].question).toBe('Do you take walk-ins?')
  })

  it('lists faqs ordered by sortOrder', async () => {
    const { createFaq, listFaqs } = await import('../../lib/faqs')
    createFaq({ question: 'Second', answer: 'b', sortOrder: 2 })
    createFaq({ question: 'First', answer: 'a', sortOrder: 1 })
    const faqs = listFaqs()
    expect(faqs.map((f) => f.question)).toEqual(['First', 'Second'])
  })

  it('updateFaq changes the answer', async () => {
    const { createFaq, updateFaq, listFaqs } = await import('../../lib/faqs')
    const f = createFaq({ question: 'Q', answer: 'old', sortOrder: 0 })
    updateFaq(f.id, { answer: 'new' })
    expect(listFaqs()[0].answer).toBe('new')
  })

  it('deleteFaq removes it', async () => {
    const { createFaq, deleteFaq, listFaqs } = await import('../../lib/faqs')
    const f = createFaq({ question: 'Q', answer: 'A', sortOrder: 0 })
    deleteFaq(f.id)
    expect(listFaqs()).toHaveLength(0)
  })
})
