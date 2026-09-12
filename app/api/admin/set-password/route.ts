import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, createSessionToken, verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'
import { getAdminPasswordHash, setAdminPasswordHash } from '@/lib/settings'

// Public route on purpose (see middleware.ts), but only actually unauthenticated
// for the very first setup. If a password already exists, changing it requires a
// valid session — checked here manually since this path is exempt from the
// middleware's blanket /api/admin/* auth gate.
export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'password_too_short' }, { status: 400 })
  }

  const alreadySet = Boolean(getAdminPasswordHash())
  if (alreadySet) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const authed = await verifySessionToken(token)
    if (!authed) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  setAdminPasswordHash(await hashPassword(password))

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return res
}
