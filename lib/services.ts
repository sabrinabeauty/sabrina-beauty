import { getDb } from './db'

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
  active: number
}

function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    pricePence: row.price_pence,
    durationMinutes: row.duration_minutes,
    active: row.active === 1,
  }
}

export function listServices(opts: { activeOnly?: boolean } = {}): Service[] {
  const db = getDb()
  const rows = opts.activeOnly
    ? db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY category, price_pence').all()
    : db.prepare('SELECT * FROM services ORDER BY category, price_pence').all()
  return (rows as ServiceRow[]).map(rowToService)
}

export function getService(id: number): Service | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id) as ServiceRow | undefined
  return row ? rowToService(row) : undefined
}

export function createService(input: Omit<Service, 'id'>): Service {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO services (name, category, description, price_pence, duration_minutes, active)
       VALUES (@name, @category, @description, @pricePence, @durationMinutes, @active)`
    )
    .run({ ...input, active: input.active ? 1 : 0 })
  return getService(result.lastInsertRowid as number)!
}

export function updateService(id: number, input: Partial<Omit<Service, 'id'>>): Service {
  const existing = getService(id)
  if (!existing) throw new Error(`Service ${id} not found`)
  const merged = { ...existing, ...input }
  const db = getDb()
  db.prepare(
    `UPDATE services SET name = @name, category = @category, description = @description,
     price_pence = @pricePence, duration_minutes = @durationMinutes, active = @active WHERE id = @id`
  ).run({ ...merged, active: merged.active ? 1 : 0 })
  return getService(id)!
}

export function deactivateService(id: number): void {
  updateService(id, { active: false })
}
