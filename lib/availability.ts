import { getDb } from './db'
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

export function generateSlots(date: string, durationMinutes: number): string[] {
  const weekday = new Date(`${date}T00:00:00`).getDay()
  const hours = getSiteContent().workingHours[weekday]
  if (!hours) return []

  const start = toMinutes(hours.start)
  const end = toMinutes(hours.end)
  const slots: string[] = []
  for (let t = start; t + durationMinutes <= end; t += SLOT_STEP_MINUTES) {
    slots.push(toHHMM(t))
  }
  return slots
}

export function isSlotBlocked(date: string, time: string): boolean {
  const db = getDb()
  const wholeDay = db.prepare('SELECT 1 FROM blocked_slots WHERE date = ? AND time IS NULL').get(date)
  if (wholeDay) return true
  const exact = db.prepare('SELECT 1 FROM blocked_slots WHERE date = ? AND time = ?').get(date, time)
  return Boolean(exact)
}
