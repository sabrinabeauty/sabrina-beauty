// app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import type { Booking } from '@/lib/bookings'
import type { Service } from '@/lib/services'
import AdminProductsSection from '@/components/AdminProductsSection'
import AdminChangePassword from '@/components/AdminChangePassword'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [homepageVariant, setHomepageVariantState] = useState<'original' | 'new'>('new')
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({})
  const [savingPriceFor, setSavingPriceFor] = useState<number | null>(null)
  const [newTreatment, setNewTreatment] = useState({
    name: '',
    category: 'facial' as 'facial' | 'brow',
    description: '',
    price: '',
    duration: '',
  })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

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

  async function savePrice(service: Service) {
    const draft = draftPrices[service.id]
    if (draft === undefined) return
    const pounds = Number(draft)
    if (Number.isNaN(pounds) || pounds < 0) return

    setSavingPriceFor(service.id)
    await fetch(`/api/admin/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricePence: Math.round(pounds * 100) }),
    })
    setDraftPrices((prev) => {
      const next = { ...prev }
      delete next[service.id]
      return next
    })
    setSavingPriceFor(null)
    refresh()
  }

  async function createTreatment(e: React.FormEvent) {
    e.preventDefault()
    setCreateError('')

    const name = newTreatment.name.trim()
    const description = newTreatment.description.trim()
    const price = Number(newTreatment.price)
    const duration = Number(newTreatment.duration)

    if (!name || !description) {
      setCreateError('Name and description are required.')
      return
    }
    if (Number.isNaN(price) || price < 0) {
      setCreateError('Enter a valid price.')
      return
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      setCreateError('Enter a valid duration in minutes.')
      return
    }

    setCreating(true)
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category: newTreatment.category,
        description,
        pricePence: Math.round(price * 100),
        durationMinutes: duration,
        active: true,
      }),
    })
    setCreating(false)

    if (!res.ok) {
      setCreateError('Something went wrong — please try again.')
      return
    }

    setNewTreatment({ name: '', category: 'facial', description: '', price: '', duration: '' })
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

      <AdminChangePassword />

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

        <form onSubmit={createTreatment} className="mb-8 p-6 border border-sage/30 rounded-xl2 bg-white/60">
          <h3 className="font-medium mb-4">Add New Treatment</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium">Name</label>
              <input
                required
                value={newTreatment.name}
                onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                className="w-full border border-sage/40 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Category</label>
              <select
                value={newTreatment.category}
                onChange={(e) =>
                  setNewTreatment({ ...newTreatment, category: e.target.value as 'facial' | 'brow' })
                }
                className="w-full border border-sage/40 rounded px-3 py-2 bg-white"
              >
                <option value="facial">Facial</option>
                <option value="brow">Brow</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Price (&pound;)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={newTreatment.price}
                onChange={(e) => setNewTreatment({ ...newTreatment, price: e.target.value })}
                className="w-full border border-sage/40 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Duration (minutes)</label>
              <input
                required
                type="number"
                min="1"
                step="1"
                value={newTreatment.duration}
                onChange={(e) => setNewTreatment({ ...newTreatment, duration: e.target.value })}
                className="w-full border border-sage/40 rounded px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-1 text-sm font-medium">Description</label>
              <textarea
                required
                rows={3}
                value={newTreatment.description}
                onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                className="w-full border border-sage/40 rounded px-3 py-2"
              />
            </div>
          </div>

          {createError && <p className="text-sm text-red-600 mt-3">{createError}</p>}

          <button
            type="submit"
            disabled={creating}
            className="mt-4 bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
          >
            {creating ? 'Adding…' : 'Add Treatment'}
          </button>
        </form>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-sage/30">
              <th className="py-2">Name</th><th>Price</th><th>Active</th><th />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const currentPounds = (s.pricePence / 100).toFixed(2)
              const draft = draftPrices[s.id] ?? currentPounds
              const isDirty = draft !== currentPounds
              return (
                <tr key={s.id} className="border-b border-sage/10">
                  <td className="py-2">{s.name}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span>&pound;</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft}
                        onChange={(e) =>
                          setDraftPrices((prev) => ({ ...prev, [s.id]: e.target.value }))
                        }
                        className="w-20 border border-sage/40 rounded px-2 py-1"
                      />
                      {isDirty && (
                        <button
                          onClick={() => savePrice(s)}
                          disabled={savingPriceFor === s.id}
                          className="text-sage underline disabled:opacity-40"
                        >
                          {savingPriceFor === s.id ? 'Saving…' : 'Save'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>{s.active ? 'Yes' : 'No'}</td>
                  <td>
                    <button onClick={() => toggleActive(s)} className="text-sage underline">
                      {s.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <hr className="my-16 border-sage/20" />

      <AdminProductsSection />
    </div>
  )
}
