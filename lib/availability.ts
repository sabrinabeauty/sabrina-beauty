import { sql, ensureSchema } from './db'
import { getSiteContent } from './settings'

const SLOT_STEP_MINUTES = 30

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function generateSlots(date: string, durationMinutes: number): Promise<string[]> {
  const weekday = new Date(`${date}T00:00:00`).getDay()
  const content = await getSiteContent()
  const hours = content.workingHours[weekday]
  if (!hours) return []

  const start = toMinutes(hours.start)
  const end = toMinutes(hours.end)
  const slots: string[] = []
  for (let t = start; t + durationMinutes <= end; t += SLOT_STEP_MINUTES) {
    slots.push(toHHMM(t))
  }
  return slots
}

export async function isSlotBlocked(date: string, time: string): Promise<boolean> {
  await ensureSchema()
  const { rows: wholeDay } = await sql`SELECT 1 FROM blocked_slots WHERE date = ${date} AND time IS NULL`
  if (wholeDay.length > 0) return true
  const { rows: exact } = await sql`SELECT 1 FROM blocked_slots WHERE date = ${date} AND time = ${time}`
  return exact.length > 0
}
