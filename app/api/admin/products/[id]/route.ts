import { NextRequest, NextResponse } from 'next/server'
import { updateProduct, deactivateProduct } from '@/lib/products'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const product = updateProduct(Number(params.id), body)
  return NextResponse.json(product)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  deactivateProduct(Number(params.id))
  return NextResponse.json({ ok: true })
}
