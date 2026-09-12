'use client'

import { useEffect, useState } from 'react'
import type { Faq } from '@/lib/faqs'

export default function AdminFaqSection() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })
  const [creating, setCreating] = useState(false)

  function refresh() {
    fetch('/api/admin/faqs').then((r) => r.json()).then(setFaqs)
  }

  useEffect(refresh, [])

  async function createFaq(e: React.FormEvent) {
    e.preventDefault()
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return
    setCreating(true)
    await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newFaq, sortOrder: faqs.length }),
    })
    setCreating(false)
    setNewFaq({ question: '', answer: '' })
    refresh()
  }

  async function removeFaq(id: number) {
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <section className="mb-16">
      <h2 className="font-serif text-2xl mb-4">FAQ</h2>

      <form onSubmit={createFaq} className="mb-8 p-6 border border-sage/30 rounded-xl2 bg-white/60 space-y-4">
        <h3 className="font-medium">Add New Question</h3>
        <div>
          <label className="block mb-1 text-sm font-medium">Question</label>
          <input
            required
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
            className="w-full border border-sage/40 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Answer</label>
          <textarea
            required
            rows={3}
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
            className="w-full border border-sage/40 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {creating ? 'Adding…' : 'Add Question'}
        </button>
      </form>

      <ul className="space-y-4">
        {faqs.map((f) => (
          <li key={f.id} className="border-b border-sage/10 pb-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium">{f.question}</p>
                <p className="text-sm text-charcoal/70 mt-1">{f.answer}</p>
              </div>
              <button onClick={() => removeFaq(f.id)} className="text-red-500 underline text-sm shrink-0">
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
