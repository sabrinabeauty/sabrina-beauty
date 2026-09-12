// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [checking, setChecking] = useState(true)
  const [isSet, setIsSet] = useState(true)

  useEffect(() => {
    fetch('/api/admin/password-status')
      .then((r) => r.json())
      .then((data) => {
        setIsSet(data.isSet)
        setChecking(false)
      })
  }, [])

  if (checking) return null

  return isSet ? <LoginForm /> : <SetPasswordForm />
}

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(false)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError(true)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-center mb-8">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-sage/40 rounded-xl2 px-4 py-3"
        />
        {error && <p className="text-sm text-red-600">Incorrect password.</p>}
        <button type="submit" className="w-full bg-charcoal text-cream py-3 rounded-xl2 font-medium">
          Log in
        </button>
      </form>
    </div>
  )
}

function SetPasswordForm() {
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    const res = await fetch('/api/admin/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setSubmitting(false)

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Something went wrong — please try again.')
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-center mb-4">Set Your Admin Password</h1>
      <p className="text-sm text-charcoal/60 text-center mb-8">
        No password has been set up yet. Choose one now — you&rsquo;ll use it to log in from here on.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={reveal ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            className="w-full border border-sage/40 rounded-xl2 px-4 py-3 pr-16"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-sage font-medium"
          >
            {reveal ? 'Hide' : 'Show'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-charcoal text-cream py-3 rounded-xl2 font-medium disabled:opacity-40"
        >
          {submitting ? 'Setting password…' : 'Set Password & Log In'}
        </button>
      </form>
    </div>
  )
}
