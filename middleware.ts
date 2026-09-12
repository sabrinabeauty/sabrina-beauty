import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/session'

// These must stay reachable without a session — otherwise nobody could ever log in
// or do first-time password setup, since the request itself would be blocked.
const PUBLIC_ADMIN_API_PATHS = [
  '/api/admin/login',
  '/api/admin/logout',
  '/api/admin/password-status',
  '/api/admin/set-password',
]

export async function middleware(request: NextRequest) {
  if (PUBLIC_ADMIN_API_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const authed = await verifySessionToken(token)

  if (!authed) {
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/api/admin/:path*'],
}
