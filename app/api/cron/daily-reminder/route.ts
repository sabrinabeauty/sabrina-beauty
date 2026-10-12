// app/api/cron/daily-reminder/route.ts
//
// Triggered by Vercel Cron (vercel.json) once a day — sends Sabrina one
// email listing every booking for today, so she doesn't have to open the
// admin dashboard every morning to know what's coming in.
//
// Protected by CRON_SECRET: Vercel automatically sends
// `Authorization: Bearer ${CRON_SECRET}` on its own cron-triggered
// requests when that env var is set — this is Vercel's own documented
// convention, not something this route invents — so checking it here
// stops anyone else from hitting this route and forcing an email send.
// CRON_SECRET lives only in Vercel's env vars, never locally (same
// convention as the Cog project).
import { NextRequest, NextResponse } from 'next/server'
import { listBookingsForDate } from '@/lib/bookings'
import { getService } from '@/lib/services'
import { sendDailyReminder, type DailyReminderItem } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // This route is scheduled (vercel.json) to run in the morning UK time
  // (07:00 UTC — 07:00 GMT / 08:00 BST, so well clear of the UK midnight
  // boundary either way), so the UTC calendar date and the UK calendar
  // date are the same at the moment this runs.
  const today = new Date().toISOString().slice(0, 10)

  const bookings = await listBookingsForDate(today)
  if (bookings.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: 'no_bookings', date: today })
  }

  const items: DailyReminderItem[] = []
  for (const booking of bookings) {
    const service = await getService(booking.serviceId)
    if (service) items.push({ booking, service })
  }

  await sendDailyReminder(today, items)

  return NextResponse.json({ ok: true, sent: true, date: today, count: items.length })
}
