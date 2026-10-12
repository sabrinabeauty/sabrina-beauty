'use client'

import { useEffect, useState } from 'react'
import type { WorkingHours, DayHours } from '@/lib/settings'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type BlockedSlot = { id: number; date: string; time: string | null }

export default function AdminAvailabilitySection() {
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null)
  const [savingHours, setSavingHours] = useState(false)
  const [hoursSaved, setHoursSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [newBlockDate, setNewBlockDate] = useState('')

  async function refresh() {
    const [contentRes, blockedRes] = await Promise.all([
      fetch('/api/admin/site-content'),
      fetch('/api/admin/blocked-slots'),
    ])
    if (!contentRes.ok || !blockedRes.ok) {
      setError('Could not load — your admin session may have expired. Try refreshing the page.')
      return
    }
    setError(null)
    setWorkingHours((await contentRes.json()).workingHours)
    setBlockedSlots(await blockedRes.json())
  }

  useEffect(() => {
    refresh()
  }, [])

  function setDay(day: number, hours: DayHours) {
    setWorkingHours((prev) => (prev ? { ...prev, [day]: hours } : prev))
  }

  // Previously this always showed "Saved." regardless of whether the
  // request actually succeeded — a failed save (e.g. expired session)
  // looked identical to a real one, so a working-hours change could
  // silently not take effect with no indication anything was wrong.
  async function saveWorkingHours() {
    setSavingHours(true)
    setHoursSaved(false)
    setError(null)
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingHours }),
      })
      if (!res.ok) {
        setError('Could not save — your admin session may have expired. Try refreshing the page and logging in again.')
        return
      }
      setHoursSaved(true)
    } finally {
      setSavingHours(false)
    }
  }

  async function addBlockedDate(e: React.FormEvent) {
    e.preventDefault()
    if (!newBlockDate) return
    setError(null)
    const res = await fetch('/api/admin/blocked-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newBlockDate, time: null }),
    })
    if (!res.ok) {
      setError('Could not block that date — your admin session may have expired. Try refreshing the page and logging in again.')
      return
    }
    setNewBlockDate('')
    await refresh()
  }

  async function removeBlockedDate(id: number) {
    setError(null)
    const res = await fetch(`/api/admin/blocked-slots?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('Could not remove — your admin session may have expired. Try refreshing the page and logging in again.')
      return
    }
    await refresh()
  }

  if (!workingHours) return error ? <p className="text-sm text-red-600">{error}</p> : null

  return (
    <>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
              className="min-w-0 max-w-full box-border appearance-none border border-sage/40 rounded px-3 py-2"
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
