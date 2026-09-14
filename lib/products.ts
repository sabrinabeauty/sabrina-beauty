import { sql, ensureSchema } from './db'

export type Product = {
  id: number
  name: string
  description: string
  pricePence: number
  imagePath: string | null
  active: boolean
}

type ProductRow = {
  id: number
  name: string
  description: string
  price_pence: number
  image_path: string | null
  active: boolean
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    pricePence: row.price_pence,
    imagePath: row.image_path,
    active: row.active,
  }
}

export async function listProducts(opts: { activeOnly?: boolean } = {}): Promise<Product[]> {
  await ensureSchema()
  const { rows } = opts.activeOnly
    ? await sql<ProductRow>`SELECT * FROM products WHERE active = true ORDER BY name`
    : await sql<ProductRow>`SELECT * FROM products ORDER BY name`
  return rows.map(rowToProduct)
}

export async function getProduct(id: number): Promise<Product | undefined> {
  await ensureSchema()
  const { rows } = await sql<ProductRow>`SELECT * FROM products WHERE id = ${id}`
  return rows[0] ? rowToProduct(rows[0]) : undefined
}

export async function createProduct(input: Omit<Product, 'id'>): Promise<Product> {
  await ensureSchema()
  const { rows } = await sql<ProductRow>`
    INSERT INTO products (name, description, price_pence, image_path, active)
    VALUES (${input.name}, ${input.description}, ${input.pricePence}, ${input.imagePath}, ${input.active})
    RETURNING *
  `
  return rowToProduct(rows[0])
}

export async function updateProduct(id: number, input: Partial<Omit<Product, 'id'>>): Promise<Product> {
  const existing = await getProduct(id)
  if (!existing) throw new Error(`Product ${id} not found`)
  const merged = { ...existing, ...input }
  const { rows } = await sql<ProductRow>`
    UPDATE products SET name = ${merged.name}, description = ${merged.description},
      price_pence = ${merged.pricePence}, image_path = ${merged.imagePath}, active = ${merged.active}
    WHERE id = ${id}
    RETURNING *
  `
  return rowToProduct(rows[0])
}

export async function deactivateProduct(id: number): Promise<void> {
  await updateProduct(id, { active: false })
}
