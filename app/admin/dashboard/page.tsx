// app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import type { Booking } from '@/lib/bookings'
import type { Service } from '@/lib/services'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [homepageVariant, setHomepageVariantState] = useState<'original' | 'new'>('new')

  function refresh() {
    fetch('/api/admin/bookings').then((r) => r.json()).then(setBookings)
    fetch('/api/admin/services').then((r) => r.json()).then(setServices)
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => setHomepageVariantState(data.homepageVariant))
  }

  useEffect(refresh, [])

  async function selectHomepageVariant(variant: 'original' | 'new') {
    setHomepageVariantState(variant)
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homepageVariant: variant }),
    })
  }

  async function setStatus(id: number, status: Booking['status']) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    refresh()
  }

  async function toggleActive(service: Service) {
    if (service.active) {
      await fetch(`/api/admin/services/${service.id}`, { method: 'DELETE' })
    } else {
      await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true }),
      })
    }
    refresh()
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl mb-10">Admin Dashboard</h1>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">Homepage Design</h2>
        <p className="text-sm text-charcoal/60 mb-4">
          Choose which homepage version visitors see. Changes take effect immediately.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => selectHomepageVariant('new')}
            className={`px-4 py-2 rounded-xl2 border text-sm font-medium ${
              homepageVariant === 'new' ? 'bg-sage text-white border-sage' : 'border-sage/40 hover:bg-sage/10'
            }`}
          >
            New (editorial split-layout hero)
          </button>
          <button
            onClick={() => selectHomepageVariant('original')}
            className={`px-4 py-2 rounded-xl2 border text-sm font-medium ${
              homepageVariant === 'original' ? 'bg-sage text-white border-sage' : 'border-sage/40 hover:bg-sage/10'
            }`}
          >
            Original (full-bleed centered hero)
          </button>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">Bookings</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-sage/30">
              <th className="py-2">Date</th><th>Time</th><th>Client</th><th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-sage/10">
                <td className="py-2">{b.date}</td>
                <td>{b.time}</td>
                <td>{b.clientName} &middot; {b.clientEmail} &middot; {b.clientPhone}</td>
                <td>{b.status}</td>
                <td className="space-x-2">
                  <button onClick={() => setStatus(b.id, 'confirmed')} className="text-sage underline">Confirm</button>
                  <button onClick={() => setStatus(b.id, 'cancelled')} className="text-red-500 underline">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">Services</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-sage/30">
              <th className="py-2">Name</th><th>Price</th><th>Active</th><th />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-sage/10">
                <td className="py-2">{s.name}</td>
                <td>&pound;{(s.pricePence / 100).toFixed(0)}</td>
                <td>{s.active ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleActive(s)} className="text-sage underline">
                    {s.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
