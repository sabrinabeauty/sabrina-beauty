import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const authed = verifySessionToken(token)

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
