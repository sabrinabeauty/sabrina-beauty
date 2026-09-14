import { createProduct, listProducts } from '../lib/products'

const demoProducts: Array<Parameters<typeof createProduct>[0]> = [
  {
    name: 'Vegan Hydrating Serum',
    description: 'A lightweight, fast-absorbing serum packed with plant-derived hyaluronic acid to deeply hydrate and plump the skin.',
    pricePence: 3200,
    imagePath: '/images/products/hydrating-serum.jpg',
    active: true,
  },
  {
    name: 'Nourishing Night Cream',
    description: 'A rich, botanical-infused overnight cream that replenishes moisture and supports skin renewal while you sleep.',
    pricePence: 4500,
    imagePath: '/images/products/night-cream.jpg',
    active: true,
  },
  {
    name: 'Gentle Cleansing Lotion',
    description: 'A soothing, sulphate-free cleanser that lifts away impurities without stripping the skin’s natural moisture.',
    pricePence: 2400,
    imagePath: '/images/products/cleansing-lotion.jpg',
    active: true,
  },
]

async function main() {
  const existing = await listProducts()
  if (existing.length > 0) {
    console.log(`Products table already has ${existing.length} rows — skipping seed.`)
    return
  }
  for (const p of demoProducts) await createProduct(p)
  console.log(`Seeded ${demoProducts.length} demo products.`)
}

main()
