import { getDb } from './db'

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
  active: number
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    pricePence: row.price_pence,
    imagePath: row.image_path,
    active: row.active === 1,
  }
}

export function listProducts(opts: { activeOnly?: boolean } = {}): Product[] {
  const db = getDb()
  const rows = opts.activeOnly
    ? db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY name').all()
    : db.prepare('SELECT * FROM products ORDER BY name').all()
  return (rows as ProductRow[]).map(rowToProduct)
}

export function getProduct(id: number): Product | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRow | undefined
  return row ? rowToProduct(row) : undefined
}

export function createProduct(input: Omit<Product, 'id'>): Product {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO products (name, description, price_pence, image_path, active)
       VALUES (@name, @description, @pricePence, @imagePath, @active)`
    )
    .run({ ...input, active: input.active ? 1 : 0 })
  return getProduct(result.lastInsertRowid as number)!
}

export function updateProduct(id: number, input: Partial<Omit<Product, 'id'>>): Product {
  const existing = getProduct(id)
  if (!existing) throw new Error(`Product ${id} not found`)
  const merged = { ...existing, ...input }
  const db = getDb()
  db.prepare(
    `UPDATE products SET name = @name, description = @description,
     price_pence = @pricePence, image_path = @imagePath, active = @active WHERE id = @id`
  ).run({ ...merged, active: merged.active ? 1 : 0 })
  return getProduct(id)!
}

export function deactivateProduct(id: number): void {
  updateProduct(id, { active: false })
}
