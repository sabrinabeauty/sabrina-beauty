'use client'

import { useEffect, useRef, useState } from 'react'
import type { HeroPhoto } from '@/lib/heroPhotos'

const BUILT_IN_PHOTOS = [
  { imagePath: '/images/hero.jpg', label: 'New homepage design — default' },
  { imagePath: '/images/hero-original.jpg', label: 'Original homepage design — default' },
]

export default function AdminHeroPhotosSection() {
  const [photos, setPhotos] = useState<HeroPhoto[]>([])
  const [activeImagePath, setActiveImagePath] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selecting, setSelecting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function refresh() {
    fetch('/api/admin/hero-photos')
      .then((r) => r.json())
      .then(setPhotos)
    fetch('/api/admin/site-content')
      .then((r) => r.json())
      .then((data) => setActiveImagePath(data.heroImagePath))
  }

  useEffect(refresh, [])

  async function selectPhoto(imagePath: string) {
    setSelecting(imagePath)
    await fetch('/api/admin/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroImagePath: imagePath }),
    })
    setActiveImagePath(imagePath)
    setSelecting(null)
  }

  async function uploadPhoto(file: File) {
    setError('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const uploadRes = await fetch('/api/admin/hero-image/upload', { method: 'POST', body: formData })
    if (!uploadRes.ok) {
      setUploading(false)
      setError('Upload failed — please try a different file (JPEG, PNG, or WebP, under 5MB).')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    const { imagePath } = await uploadRes.json()
    await fetch('/api/admin/hero-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath }),
    })
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    refresh()
  }

  async function removePhoto(id: number, imagePath: string) {
    await fetch(`/api/admin/hero-photos/${id}`, { method: 'DELETE' })
    // A deleted photo can't stay selected — fall back to the site's built-in default.
    if (activeImagePath === imagePath) {
      await selectPhoto(BUILT_IN_PHOTOS[0].imagePath)
    }
    refresh()
  }

  const allPhotos: Array<{ key: string; imagePath: string; label?: string; removable: false } | { key: string; imagePath: string; removable: true; id: number }> = [
    ...BUILT_IN_PHOTOS.map((p) => ({ key: p.imagePath, imagePath: p.imagePath, label: p.label, removable: false as const })),
    ...photos.map((p) => ({ key: String(p.id), imagePath: p.imagePath, removable: true as const, id: p.id })),
  ]

  return (
    <section className="mb-16">
      <h2 className="font-serif text-2xl mb-4">Homepage Banner Photo</h2>
      <p className="text-sm text-charcoal/60 mb-4">
        Save as many photos here as you like, then click one to make it the live homepage banner —
        switch between them anytime, no re-uploading needed. Any photo works; it&rsquo;s automatically
        scaled and cropped to fill the banner. Wide, landscape-oriented photos crop best.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {allPhotos.map((p) => {
          const isActive = activeImagePath ? activeImagePath === p.imagePath : p.imagePath === BUILT_IN_PHOTOS[0].imagePath
          return (
            <div
              key={p.key}
              className={`relative rounded-xl2 overflow-hidden border-2 ${
                isActive ? 'border-sage' : 'border-sage/30'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imagePath} alt="" className="w-full aspect-[16/9] object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-end p-2 gap-2">
                {!isActive && (
                  <button
                    onClick={() => selectPhoto(p.imagePath)}
                    disabled={selecting === p.imagePath}
                    className="bg-white/90 text-charcoal text-xs font-medium px-2 py-1 rounded disabled:opacity-40"
                  >
                    {selecting === p.imagePath ? 'Setting…' : 'Use this photo'}
                  </button>
                )}
                {isActive && (
                  <span className="bg-sage text-white text-xs font-medium px-2 py-1 rounded">Live now</span>
                )}
                {p.removable && (
                  <button
                    onClick={() => removePhoto(p.id, p.imagePath)}
                    className="bg-white/90 text-red-600 text-xs font-medium px-2 py-1 rounded ml-auto"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadPhoto(file)
          }}
          className="text-sm"
        />
        {uploading && <span className="text-sm text-charcoal/60">Uploading…</span>}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </section>
  )
}
