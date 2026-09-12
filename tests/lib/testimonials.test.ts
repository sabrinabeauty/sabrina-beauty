import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-testimonials.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('testimonials data layer', () => {
  it('creates a testimonial and lists it', async () => {
    const { createTestimonial, listTestimonials } = await import('../../lib/testimonials')
    createTestimonial({ clientName: 'Jo', quote: 'Lovely facial!', active: true })
    const testimonials = listTestimonials()
    expect(testimonials).toHaveLength(1)
    expect(testimonials[0].clientName).toBe('Jo')
  })

  it('deactivateTestimonial hides it from activeOnly listing but keeps it in full listing', async () => {
    const { createTestimonial, deactivateTestimonial, listTestimonials } = await import(
      '../../lib/testimonials'
    )
    const t = createTestimonial({ clientName: 'Jo', quote: 'Great!', active: true })
    deactivateTestimonial(t.id)
    expect(listTestimonials({ activeOnly: true })).toHaveLength(0)
    expect(listTestimonials({ activeOnly: false })).toHaveLength(1)
  })
})
