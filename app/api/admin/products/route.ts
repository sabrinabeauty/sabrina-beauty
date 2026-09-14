import { NextRequest, NextResponse } from 'next/server'
import { listProducts, createProduct } from '@/lib/products'

export const fetchCache = 'force-no-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await listProducts())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const product = await createProduct(body)
  return NextResponse.json(product, { status: 201 })
}
