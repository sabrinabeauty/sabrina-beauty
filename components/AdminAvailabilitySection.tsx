'use client'

import { useEffect, useState } from 'react'
import type { WorkingHours, DayHours } from '@/lib/settings'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type BlockedSlot = { id: number; date: string; time: string | null }

export default function AdminAvailabilitySection() {
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null)
  const [savingHours, setSavingHours] = useState(false)
  const [hoursSaved, setHoursSaved] = useState(false)

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [newBlockDate, setNewBlockDate] = useState('')

  function refresh() {
    fetch('/api/admin/site-content')
      .then((r) => r.json())
      .then((data) => setWorkingHours(data.workingHours))
    fetch('/api/admin/blocked-slots')
      .then((r) => r.json())
      .then(setBlockedSlots)
  }

  useEffect(refresh, [])

  function setDay(day: number, hours: DayHours) {
    setWorkingHours((prev) => (prev ? { ...prev, [day]: hours } : prev))
  }

  async function saveWorkingHours() {
    setSavingHours(true)
    setHoursSaved(false)
    await fetch('/api/admin/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workingHours }),
    })
    setSavingHours(false)
    setHoursSaved(true)
  }

  async function addBlockedDate(e: React.FormEvent) {
    e.preventDefault()
    if (!newBlockDate) return
    await fetch('/api/admin/blocked-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newBlockDate, time: null }),
    })
    setNewBlockDate('')
    refresh()
  }

  async function removeBlockedDate(id: number) {
    await fetch(`/api/admin/blocked-slots?id=${id}`, { method: 'DELETE' })
    refresh()
  }

  if (!workingHours) return null

  return (
    <>
      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">Working Hours</h2>
        <p className="text-sm text-charcoal/60 mb-4">Controls which time slots are offered for booking.</p>
        <div className="space-y-2 max-w-xl">
          {DAY_LABELS.map((label, day) => {
            const hours = workingHours[day]
            const open = hours !== null
            return (
              <div key={day} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-32 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={open}
                    onChange={(e) => setDay(day, e.target.checked ? { start: '09:00', end: '17:30' } : null)}
                  />
                  {label}
                </label>
                {open && (
                  <>
                    <input
                      type="time"
                      value={hours!.start}
                      onChange={(e) => setDay(day, { ...hours!, start: e.target.value })}
                      className="border border-sage/40 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-charcoal/50">to</span>
                    <input
                      type="time"
                      value={hours!.end}
                      onChange={(e) => setDay(day, { ...hours!, end: e.target.value })}
                      className="border border-sage/40 rounded px-2 py-1 text-sm"
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
        <button
          onClick={saveWorkingHours}
          disabled={savingHours}
          className="mt-4 bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {savingHours ? 'Saving…' : 'Save Working Hours'}
        </button>
        {hoursSaved && <p className="text-sm text-sage mt-2">Saved.</p>}
      </section>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">Block Out Dates</h2>
        <p className="text-sm text-charcoal/60 mb-4">
          Blocks an entire day from booking — useful for holidays or days you&rsquo;re fully unavailable.
        </p>
        <form onSubmit={addBlockedDate} className="flex items-end gap-4 mb-6">
          <div>
            <label className="block mb-1 text-sm font-medium">Date</label>
            <input
              type="date"
              required
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              className="border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <button type="submit" className="bg-sage text-white px-6 py-2 rounded-xl2 font-medium">
            Block Date
          </button>
        </form>
        <ul className="space-y-2">
          {blockedSlots.map((slot) => (
            <li key={slot.id} className="flex items-center gap-4 text-sm">
              <span>{slot.date}{slot.time ? ` at ${slot.time}` : ' (full day)'}</span>
              <button onClick={() => removeBlockedDate(slot.id)} className="text-red-500 underline">
                Remove
              </button>
            </li>
          ))}
          {blockedSlots.length === 0 && <li className="text-sm text-charcoal/50">No dates blocked.</li>}
        </ul>
      </section>
    </>
  )
}
