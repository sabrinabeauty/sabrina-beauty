import { describe, it, expect, beforeEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-products.db')

beforeEach(async () => {
  process.env.SABRINA_DB_PATH = TEST_DB_PATH
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
  const { resetDbForTests } = await import('../../lib/db')
  resetDbForTests()
})

describe('products data layer', () => {
  it('creates a product and lists it', async () => {
    const { createProduct, listProducts } = await import('../../lib/products')
    createProduct({
      name: 'Hydrating Serum',
      description: 'A lightweight vegan serum.',
      pricePence: 3200,
      imagePath: '/images/products/serum.jpg',
      active: true,
    })
    const products = listProducts()
    expect(products).toHaveLength(1)
    expect(products[0].name).toBe('Hydrating Serum')
    expect(products[0].imagePath).toBe('/images/products/serum.jpg')
  })

  it('updateProduct changes the price and it is reflected in listProducts', async () => {
    const { createProduct, updateProduct, listProducts } = await import('../../lib/products')
    const p = createProduct({
      name: 'Night Cream',
      description: 'Rich overnight moisturiser.',
      pricePence: 4500,
      imagePath: null,
      active: true,
    })
    updateProduct(p.id, { pricePence: 5000 })
    const updated = listProducts().find((x) => x.id === p.id)
    expect(updated?.pricePence).toBe(5000)
  })

  it('deactivateProduct hides it from activeOnly listing but keeps it in full listing', async () => {
    const { createProduct, deactivateProduct, listProducts } = await import('../../lib/products')
    const p = createProduct({
      name: 'Vitamin C Serum',
      description: 'Brightening antioxidant serum.',
      pricePence: 3800,
      imagePath: null,
      active: true,
    })
    deactivateProduct(p.id)
    expect(listProducts({ activeOnly: true })).toHaveLength(0)
    expect(listProducts({ activeOnly: false })).toHaveLength(1)
  })
})
