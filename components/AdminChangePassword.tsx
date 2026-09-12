'use client'

import { useState } from 'react'

export default function AdminChangePassword() {
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setStatus('saving')
    const res = await fetch('/api/admin/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setStatus('idle')

    if (!res.ok) {
      setError('Something went wrong — please try again.')
      return
    }

    setPassword('')
    setStatus('done')
  }

  return (
    <section className="mb-16">
      <h2 className="font-serif text-2xl mb-4">Change Admin Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">New password</label>
          <div className="relative">
            <input
              type={reveal ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-sage/40 rounded px-3 py-2 pr-14"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage font-medium"
            >
              {reveal ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={status === 'saving'}
          className="bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {status === 'saving' ? 'Saving…' : 'Update Password'}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {status === 'done' && <p className="text-sm text-sage mt-2">Password updated.</p>}
    </section>
  )
}
