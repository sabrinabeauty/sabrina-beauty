import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createProduct, updateProduct, deactivateProduct, listProducts } from '../../lib/products'

beforeEach(async () => {
  await resetDbForTests()
})

describe('products data layer', () => {
  it('creates a product and lists it', async () => {
    await createProduct({
      name: 'Hydrating Serum',
      description: 'A lightweight vegan serum.',
      pricePence: 3200,
      imagePath: '/images/products/serum.jpg',
      active: true,
    })
    const products = await listProducts()
    expect(products).toHaveLength(1)
    expect(products[0].name).toBe('Hydrating Serum')
    expect(products[0].imagePath).toBe('/images/products/serum.jpg')
  })

  it('updateProduct changes the price and it is reflected in listProducts', async () => {
    const p = await createProduct({
      name: 'Night Cream',
      description: 'Rich overnight moisturiser.',
      pricePence: 4500,
      imagePath: null,
      active: true,
    })
    await updateProduct(p.id, { pricePence: 5000 })
    const updated = (await listProducts()).find((x) => x.id === p.id)
    expect(updated?.pricePence).toBe(5000)
  })

  it('deactivateProduct hides it from activeOnly listing but keeps it in full listing', async () => {
    const p = await createProduct({
      name: 'Vitamin C Serum',
      description: 'Brightening antioxidant serum.',
      pricePence: 3800,
      imagePath: null,
      active: true,
    })
    await deactivateProduct(p.id)
    expect(await listProducts({ activeOnly: true })).toHaveLength(0)
    expect(await listProducts({ activeOnly: false })).toHaveLength(1)
  })
})
