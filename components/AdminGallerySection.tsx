'use client'

import { useEffect, useRef, useState } from 'react'
import type { GalleryImage } from '@/lib/gallery'

export default function AdminGallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function refresh() {
    fetch('/api/admin/gallery').then((r) => r.json()).then(setImages)
  }

  useEffect(refresh, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!file) {
      setError('Choose an image first.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const uploadRes = await fetch('/api/admin/gallery/upload', { method: 'POST', body: formData })
    if (!uploadRes.ok) {
      setUploading(false)
      setError('Image upload failed — please try a different file (JPEG, PNG, or WebP, under 5MB).')
      return
    }
    const { imagePath } = await uploadRes.json()

    await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath, caption: caption.trim() || null, active: true }),
    })
    setUploading(false)
    setCaption('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    refresh()
  }

  async function removeImage(id: number) {
    await fetch(`/api/admin/gallery/${id}?hard=true`, { method: 'DELETE' })
    refresh()
  }

  return (
    <section className="mb-16">
      <h2 className="font-serif text-2xl mb-4">Gallery</h2>
      <p className="text-sm text-charcoal/60 mb-4">
        Before/after or treatment photos — only add real, consented client images.
      </p>

      <form onSubmit={handleUpload} className="mb-8 p-6 border border-sage/30 rounded-xl2 bg-white/60 space-y-4">
        <h3 className="font-medium">Add New Photo</h3>
        <div>
          <label className="block mb-1 text-sm font-medium">Image (JPEG, PNG, or WebP, under 5MB)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border border-sage/40 rounded px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={uploading}
          className="bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {uploading ? 'Uploading…' : 'Add Photo'}
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.imagePath} alt={img.caption ?? ''} className="w-full h-32 object-cover rounded" />
            <button
              onClick={() => removeImage(img.id)}
              className="absolute top-1 right-1 bg-charcoal/80 text-white text-xs px-2 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))}
        {images.length === 0 && <p className="text-sm text-charcoal/50 col-span-full">No photos yet.</p>}
      </div>
    </section>
  )
}
