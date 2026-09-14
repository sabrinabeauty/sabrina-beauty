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

function formatDateKey(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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
  onSetStatus,
  onDelete,
}: {
  bookings: Booking[]
  services: Service[]
  todayKey: string
  onSetStatus: (id: number, status: Booking['status']) => void
  onDelete: (id: number) => void
}) {
  const today = useMemo(() => new Date(`${todayKey}T00:00:00`), [todayKey])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

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

  function selectDate(dateKey: string) {
    setConfirmDeleteId(null)
    setSelectedDate((current) => (current === dateKey ? null : dateKey))
  }

  const selectedDayBookings = selectedDate ? bookingsByDate.get(selectedDate) ?? [] : []

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
          const isSelected = cell.dateKey === selectedDate
          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => selectDate(cell.dateKey)}
              className={`text-left bg-white/60 hover:bg-sage/10 min-h-[100px] p-1.5 flex flex-col gap-1 cursor-pointer transition-colors ${
                isToday ? 'ring-2 ring-inset ring-sage' : ''
              } ${isSelected ? 'ring-2 ring-inset ring-charcoal bg-sage/10' : ''}`}
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
            </button>
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

      {selectedDate && (
        <div className="mt-4 p-4 border border-sage/30 rounded-xl2 bg-white/60">
          <h4 className="font-medium mb-3">{formatDateKey(selectedDate)}</h4>
          {selectedDayBookings.length === 0 ? (
            <p className="text-sm text-charcoal/60">No bookings on this day.</p>
          ) : (
            <ul className="space-y-3">
              {selectedDayBookings.map((b) => (
                <li key={b.id} className="text-sm border-b border-sage/10 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{b.time}</span>
                    <span>{b.clientName}</span>
                    <span className={`text-xs ${b.status === 'cancelled' ? 'text-charcoal/40 line-through' : 'text-charcoal/60'}`}>
                      {serviceNameById.get(b.serviceId) ?? 'Service'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded border border-sage/30">{b.status}</span>
                  </div>
                  <div className="text-charcoal/60 text-xs mt-1">
                    {b.clientEmail} &middot; {b.clientPhone}
                  </div>
                  <div className="mt-2 space-x-3">
                    <button onClick={() => onSetStatus(b.id, 'confirmed')} className="text-sage underline text-sm">
                      Confirm
                    </button>
                    <button onClick={() => onSetStatus(b.id, 'cancelled')} className="text-red-500 underline text-sm">
                      Cancel
                    </button>
                    {confirmDeleteId === b.id ? (
                      <>
                        <button
                          onClick={() => {
                            onDelete(b.id)
                            setConfirmDeleteId(null)
                          }}
                          className="text-red-700 font-medium underline text-sm"
                        >
                          Confirm delete
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-charcoal/50 underline text-sm">
                          Keep
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(b.id)} className="text-red-700 underline text-sm">
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
