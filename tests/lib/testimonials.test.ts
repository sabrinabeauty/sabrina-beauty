import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createTestimonial, deactivateTestimonial, listTestimonials } from '../../lib/testimonials'

beforeEach(async () => {
  await resetDbForTests()
})

describe('testimonials data layer', () => {
  it('creates a testimonial and lists it', async () => {
    await createTestimonial({ clientName: 'Jo', quote: 'Lovely facial!', active: true })
    const testimonials = await listTestimonials()
    expect(testimonials).toHaveLength(1)
    expect(testimonials[0].clientName).toBe('Jo')
  })

  it('deactivateTestimonial hides it from activeOnly listing but keeps it in full listing', async () => {
    const t = await createTestimonial({ clientName: 'Jo', quote: 'Great!', active: true })
    await deactivateTestimonial(t.id)
    expect(await listTestimonials({ activeOnly: true })).toHaveLength(0)
    expect(await listTestimonials({ activeOnly: false })).toHaveLength(1)
  })
})
