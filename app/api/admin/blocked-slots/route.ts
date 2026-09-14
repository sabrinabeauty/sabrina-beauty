// app/api/admin/blocked-slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  await ensureSchema()
  const { rows } = await sql`SELECT * FROM blocked_slots ORDER BY date`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { date, time } = await request.json()
  await ensureSchema()
  await sql`
    INSERT INTO blocked_slots (date, time) VALUES (${date}, ${time ?? null})
    ON CONFLICT (date, time) DO NOTHING
  `
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const id = Number(request.nextUrl.searchParams.get('id'))
  await ensureSchema()
  await sql`DELETE FROM blocked_slots WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
