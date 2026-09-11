'use client'

import { useEffect, useState } from 'react'
import type { Service } from '@/lib/services'

export default function BookingForm() {
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState<number | ''>('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [time, setTime] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmed' | 'error'>('idle')

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then(setServices)
  }, [])

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([])
      return
    }
    let cancelled = false
    fetch(`/api/availability?serviceId=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSlots(data)
      })
    return () => {
      cancelled = true
    }
  }, [serviceId, date])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, date, time, clientName: form.name, clientEmail: form.email, clientPhone: form.phone }),
    })
    setStatus(res.ok ? 'confirmed' : 'error')
  }

  if (status === 'confirmed') {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl mb-4">You&rsquo;re booked!</h2>
        <p className="text-charcoal/70">We look forward to seeing you. A member of the team may follow up by phone or email to confirm.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div>
        <label className="block mb-2 text-sm font-medium">Treatment</label>
        <select
          required
          value={serviceId}
          onChange={(e) => setServiceId(Number(e.target.value))}
          className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white"
        >
          <option value="" disabled>Choose a treatment&hellip;</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} &mdash; &pound;{(s.pricePence / 100).toFixed(0)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Date</label>
        <input
          required
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setTime('') }}
          className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white"
        />
      </div>

      {date && (
        <div>
          <label className="block mb-2 text-sm font-medium">Time</label>
          {slots.length === 0 ? (
            <p className="text-sm text-charcoal/60">No availability on this date &mdash; please try another.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setTime(s)}
                  className={`px-3 py-2 rounded-xl2 border text-sm ${time === s ? 'bg-sage text-white border-sage' : 'border-sage/40 hover:bg-sage/10'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium">Your name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white" />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Email</label>
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white" />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium">Phone</label>
        <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-sage/40 rounded-xl2 px-4 py-3 bg-white" />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">That slot was just taken &mdash; please choose another time.</p>
      )}

      <button
        type="submit"
        disabled={!serviceId || !date || !time || status === 'submitting'}
        className="w-full bg-blush text-charcoal py-3 rounded-xl2 font-medium disabled:opacity-40"
      >
        {status === 'submitting' ? 'Booking…' : 'Confirm Booking'}
      </button>
    </form>
  )
}
