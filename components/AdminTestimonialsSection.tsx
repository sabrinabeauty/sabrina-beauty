'use client'

import { useEffect, useState } from 'react'
import type { Testimonial } from '@/lib/testimonials'

export default function AdminTestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [newTestimonial, setNewTestimonial] = useState({ clientName: '', quote: '' })
  const [creating, setCreating] = useState(false)

  function refresh() {
    fetch('/api/admin/testimonials').then((r) => r.json()).then(setTestimonials)
  }

  useEffect(refresh, [])

  async function createTestimonial(e: React.FormEvent) {
    e.preventDefault()
    if (!newTestimonial.clientName.trim() || !newTestimonial.quote.trim()) return
    setCreating(true)
    await fetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTestimonial, active: true }),
    })
    setCreating(false)
    setNewTestimonial({ clientName: '', quote: '' })
    refresh()
  }

  async function toggleActive(t: Testimonial) {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !t.active }),
    })
    refresh()
  }

  async function removeTestimonial(id: number) {
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <section className="mb-16">
      <h2 className="font-serif text-2xl mb-4">Testimonials</h2>
      <p className="text-sm text-charcoal/60 mb-4">
        Only real client reviews — these appear on the homepage under &ldquo;What Clients Say&rdquo; once added.
      </p>

      <form
        onSubmit={createTestimonial}
        className="mb-8 p-6 border border-sage/30 rounded-xl2 bg-white/60 space-y-4"
      >
        <h3 className="font-medium">Add New Testimonial</h3>
        <div>
          <label className="block mb-1 text-sm font-medium">Client name</label>
          <input
            required
            value={newTestimonial.clientName}
            onChange={(e) => setNewTestimonial({ ...newTestimonial, clientName: e.target.value })}
            className="w-full border border-sage/40 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Quote</label>
          <textarea
            required
            rows={3}
            value={newTestimonial.quote}
            onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
            className="w-full border border-sage/40 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {creating ? 'Adding…' : 'Add Testimonial'}
        </button>
      </form>

      <ul className="space-y-4">
        {testimonials.map((t) => (
          <li key={t.id} className="border-b border-sage/10 pb-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="italic text-charcoal/80">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-sm text-sage font-medium mt-1">
                  — {t.clientName} {t.active ? '' : '(hidden)'}
                </p>
              </div>
              <div className="flex gap-3 shrink-0 text-sm">
                <button onClick={() => toggleActive(t)} className="text-sage underline">
                  {t.active ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => removeTestimonial(t.id)} className="text-red-500 underline">
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
        {testimonials.length === 0 && <li className="text-sm text-charcoal/50">No testimonials yet.</li>}
      </ul>
    </section>
  )
}
