import { NextResponse } from 'next/server'
import { getAdminPasswordHash } from '@/lib/settings'

export const dynamic = 'force-dynamic'

// Public on purpose: the login page needs to know, before anyone is authenticated,
// whether to show "set a password" (first run) or the normal login form.
export async function GET() {
  return NextResponse.json({ isSet: Boolean(getAdminPasswordHash()) })
}
