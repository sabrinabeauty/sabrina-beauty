import { NextRequest, NextResponse } from 'next/server'
import { listProducts, createProduct } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(listProducts())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const product = createProduct(body)
  return NextResponse.json(product, { status: 201 })
}
