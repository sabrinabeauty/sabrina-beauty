'use client'

import { useMemo, useState } from 'react'
import type { Booking } from '@/lib/bookings'
import type { Service } from '@/lib/services'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const STATUS_STYLES: Record<Booking['status'], string> = {
  confirmed: 'bg-sage/20 text-charcoal border-sage/40',
  pending: 'bg-amber-100 text-charcoal border-amber-300',
  cancelled: 'bg-charcoal/5 text-charcoal/40 border-charcoal/10 line-through',
}

export default function AdminBookingsCalendar({
  bookings,
  services,
  todayKey,
}: {
  bookings: Booking[]
  services: Service[]
  todayKey: string
}) {
  const today = useMemo(() => new Date(`${todayKey}T00:00:00`), [todayKey])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const serviceNameById = useMemo(() => {
    const map = new Map<number, string>()
    services.forEach((s) => map.set(s.id, s.name))
    return map
  }, [services])

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const b of bookings) {
      const list = map.get(b.date) ?? []
      list.push(b)
      map.set(b.date, list)
    }
    Array.from(map.values()).forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)))
    return map
  }, [bookings])

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  // getDay(): 0=Sun..6=Sat -> convert to Monday-first index 0=Mon..6=Sun
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7

  const cells: Array<{ day: number; dateKey: string } | null> = []
  for (let i = 0; i < leadingBlanks; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, dateKey: toDateKey(viewYear, viewMonth, day) })
  }
  while (cells.length % 7 !== 0) cells.push(null)

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function goToToday() {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-serif text-xl">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="px-3 py-1 rounded border border-sage/40 text-sm hover:bg-sage/10"
          >
            ← Prev
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 rounded border border-sage/40 text-sm hover:bg-sage/10"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="px-3 py-1 rounded border border-sage/40 text-sm hover:bg-sage/10"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-sage/20 border border-sage/20 rounded-xl2 overflow-hidden">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="bg-cream text-xs font-medium text-charcoal/60 px-2 py-2 text-center">
            {label}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} className="bg-white/40 min-h-[100px]" />
          const dayBookings = bookingsByDate.get(cell.dateKey) ?? []
          const isToday = cell.dateKey === todayKey
          return (
            <div
              key={cell.dateKey}
              className={`bg-white/60 min-h-[100px] p-1.5 flex flex-col gap-1 ${
                isToday ? 'ring-2 ring-inset ring-sage' : ''
              }`}
            >
              <span className={`text-xs ${isToday ? 'font-bold text-sage' : 'text-charcoal/50'}`}>
                {cell.day}
              </span>
              {dayBookings.map((b) => (
                <div
                  key={b.id}
                  title={`${b.time} · ${b.clientName} · ${serviceNameById.get(b.serviceId) ?? 'Service'} · ${b.status}`}
                  className={`text-[11px] leading-tight rounded px-1.5 py-1 border ${STATUS_STYLES[b.status]}`}
                >
                  <div className="font-medium">{b.time} {b.clientName}</div>
                  <div className="opacity-80 truncate">{serviceNameById.get(b.serviceId) ?? 'Service'}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className="flex gap-4 mt-3 text-xs text-charcoal/60">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-sage/40 bg-sage/20 inline-block" /> Confirmed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-amber-300 bg-amber-100 inline-block" /> Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-charcoal/10 bg-charcoal/5 inline-block" /> Cancelled
        </span>
      </div>
    </div>
  )
}
