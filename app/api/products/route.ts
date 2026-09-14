import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/products'

export const fetchCache = 'force-no-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await listProducts({ activeOnly: true }))
}
