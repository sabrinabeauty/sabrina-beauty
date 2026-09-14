import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createFaq, updateFaq, deleteFaq, listFaqs } from '../../lib/faqs'

beforeEach(async () => {
  await resetDbForTests()
})

describe('faqs data layer', () => {
  it('creates a faq and lists it', async () => {
    await createFaq({ question: 'Do you take walk-ins?', answer: 'Booking ahead is recommended.', sortOrder: 0 })
    const faqs = await listFaqs()
    expect(faqs).toHaveLength(1)
    expect(faqs[0].question).toBe('Do you take walk-ins?')
  })

  it('lists faqs ordered by sortOrder', async () => {
    await createFaq({ question: 'Second', answer: 'b', sortOrder: 2 })
    await createFaq({ question: 'First', answer: 'a', sortOrder: 1 })
    const faqs = await listFaqs()
    expect(faqs.map((f) => f.question)).toEqual(['First', 'Second'])
  })

  it('updateFaq changes the answer', async () => {
    const f = await createFaq({ question: 'Q', answer: 'old', sortOrder: 0 })
    await updateFaq(f.id, { answer: 'new' })
    expect((await listFaqs())[0].answer).toBe('new')
  })

  it('deleteFaq removes it', async () => {
    const f = await createFaq({ question: 'Q', answer: 'A', sortOrder: 0 })
    await deleteFaq(f.id)
    expect(await listFaqs()).toHaveLength(0)
  })
})
