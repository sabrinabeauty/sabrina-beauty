// app/api/admin/blocked-slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  return NextResponse.json(db.prepare('SELECT * FROM blocked_slots ORDER BY date').all())
}

export async function POST(request: NextRequest) {
  const { date, time } = await request.json()
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO blocked_slots (date, time) VALUES (?, ?)').run(date, time ?? null)
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const id = Number(request.nextUrl.searchParams.get('id'))
  const db = getDb()
  db.prepare('DELETE FROM blocked_slots WHERE id = ?').run(id)
  return NextResponse.json({ ok: true })
}
