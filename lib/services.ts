import { sql, ensureSchema } from './db'

export type Service = {
  id: number
  name: string
  category: 'facial' | 'brow'
  description: string
  pricePence: number
  durationMinutes: number
  active: boolean
}

type ServiceRow = {
  id: number
  name: string
  category: 'facial' | 'brow'
  description: string
  price_pence: number
  duration_minutes: number
  active: boolean
}

function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    pricePence: row.price_pence,
    durationMinutes: row.duration_minutes,
    active: row.active,
  }
}

export async function listServices(opts: { activeOnly?: boolean } = {}): Promise<Service[]> {
  await ensureSchema()
  const { rows } = opts.activeOnly
    ? await sql<ServiceRow>`SELECT * FROM services WHERE active = true ORDER BY category, price_pence`
    : await sql<ServiceRow>`SELECT * FROM services ORDER BY category, price_pence`
  return rows.map(rowToService)
}

export async function getService(id: number): Promise<Service | undefined> {
  await ensureSchema()
  const { rows } = await sql<ServiceRow>`SELECT * FROM services WHERE id = ${id}`
  return rows[0] ? rowToService(rows[0]) : undefined
}

export async function createService(input: Omit<Service, 'id'>): Promise<Service> {
  await ensureSchema()
  const { rows } = await sql<ServiceRow>`
    INSERT INTO services (name, category, description, price_pence, duration_minutes, active)
    VALUES (${input.name}, ${input.category}, ${input.description}, ${input.pricePence}, ${input.durationMinutes}, ${input.active})
    RETURNING *
  `
  return rowToService(rows[0])
}

export async function updateService(id: number, input: Partial<Omit<Service, 'id'>>): Promise<Service> {
  const existing = await getService(id)
  if (!existing) throw new Error(`Service ${id} not found`)
  const merged = { ...existing, ...input }
  const { rows } = await sql<ServiceRow>`
    UPDATE services SET name = ${merged.name}, category = ${merged.category}, description = ${merged.description},
      price_pence = ${merged.pricePence}, duration_minutes = ${merged.durationMinutes}, active = ${merged.active}
    WHERE id = ${id}
    RETURNING *
  `
  return rowToService(rows[0])
}

export async function deactivateService(id: number): Promise<void> {
  await updateService(id, { active: false })
}
