'use client'

import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/products'

export default function AdminProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({})
  const [savingPriceFor, setSavingPriceFor] = useState<number | null>(null)

  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' })
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  function refresh() {
    fetch('/api/admin/products').then((r) => r.json()).then(setProducts)
  }

  useEffect(refresh, [])

  async function createProduct(e: React.FormEvent) {
    e.preventDefault()
    setCreateError('')

    const name = newProduct.name.trim()
    const description = newProduct.description.trim()
    const price = Number(newProduct.price)

    if (!name || !description) {
      setCreateError('Name and description are required.')
      return
    }
    if (Number.isNaN(price) || price < 0) {
      setCreateError('Enter a valid price.')
      return
    }

    setCreating(true)

    let imagePath: string | null = null
    if (newImageFile) {
      const formData = new FormData()
      formData.append('file', newImageFile)
      const uploadRes = await fetch('/api/admin/products/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) {
        setCreating(false)
        setCreateError('Image upload failed — please try a different file (JPEG, PNG, or WebP, under 5MB).')
        return
      }
      imagePath = (await uploadRes.json()).imagePath
    }

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        pricePence: Math.round(price * 100),
        imagePath,
        active: true,
      }),
    })
    setCreating(false)

    if (!res.ok) {
      setCreateError('Something went wrong — please try again.')
      return
    }

    setNewProduct({ name: '', description: '', price: '' })
    setNewImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    refresh()
  }

  async function savePrice(product: Product) {
    const draft = draftPrices[product.id]
    if (draft === undefined) return
    const pounds = Number(draft)
    if (Number.isNaN(pounds) || pounds < 0) return

    setSavingPriceFor(product.id)
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricePence: Math.round(pounds * 100) }),
    })
    setDraftPrices((prev) => {
      const next = { ...prev }
      delete next[product.id]
      return next
    })
    setSavingPriceFor(null)
    refresh()
  }

  async function toggleActive(product: Product) {
    if (product.active) {
      await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    } else {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true }),
      })
    }
    refresh()
  }

  return (
    <section>
      <h2 className="font-serif text-2xl mb-4">Products</h2>

      <form onSubmit={createProduct} className="mb-8 p-6 border border-sage/30 rounded-xl2 bg-white/60">
        <h3 className="font-medium mb-4">Add New Product</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Name</label>
            <input
              required
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Price (&pound;)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1 text-sm font-medium">Description</label>
            <textarea
              required
              rows={3}
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1 text-sm font-medium">Image (JPEG, PNG, or WebP, under 5MB)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </div>
        </div>

        {createError && <p className="text-sm text-red-600 mt-3">{createError}</p>}

        <button
          type="submit"
          disabled={creating}
          className="mt-4 bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {creating ? 'Adding…' : 'Add Product'}
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-sage/30">
            <th className="py-2">Image</th><th>Name</th><th>Price</th><th>Active</th><th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const currentPounds = (p.pricePence / 100).toFixed(2)
            const draft = draftPrices[p.id] ?? currentPounds
            const isDirty = draft !== currentPounds
            return (
              <tr key={p.id} className="border-b border-sage/10">
                <td className="py-2">
                  {p.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imagePath} alt={p.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-sage/10" />
                  )}
                </td>
                <td>{p.name}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span>&pound;</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft}
                      onChange={(e) => setDraftPrices((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-20 border border-sage/40 rounded px-2 py-1"
                    />
                    {isDirty && (
                      <button
                        onClick={() => savePrice(p)}
                        disabled={savingPriceFor === p.id}
                        className="text-sage underline disabled:opacity-40"
                      >
                        {savingPriceFor === p.id ? 'Saving…' : 'Save'}
                      </button>
                    )}
                  </div>
                </td>
                <td>{p.active ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleActive(p)} className="text-sage underline">
                    {p.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
