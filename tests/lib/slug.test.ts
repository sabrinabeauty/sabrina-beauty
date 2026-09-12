import { describe, it, expect } from 'vitest'
import { slugify } from '../../lib/slug'

describe('slugify', () => {
  it('lowercases and hyphenates a treatment name', () => {
    expect(slugify('HydraDermabrasion')).toBe('hydradermabrasion')
    expect(slugify('Botanical Skin Lift Facial')).toBe('botanical-skin-lift-facial')
    expect(slugify('Brow Tinting & Shape')).toBe('brow-tinting-shape')
  })
})
