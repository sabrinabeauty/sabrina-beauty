'use client'

import { useEffect, useRef, useState } from 'react'
import type { SiteContent } from '@/lib/settings'

type SavableKey = keyof SiteContent

export default function AdminSiteContentSection() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [savingGroup, setSavingGroup] = useState<string | null>(null)
  const [savedGroup, setSavedGroup] = useState<string | null>(null)
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false)
  const [heroImageError, setHeroImageError] = useState('')
  const heroFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/site-content')
      .then((r) => r.json())
      .then(setContent)
  }, [])

  async function save(group: string, patch: Partial<SiteContent>) {
    setSavingGroup(group)
    setSavedGroup(null)
    const res = await fetch('/api/admin/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const updated = await res.json()
    setContent(updated)
    setSavingGroup(null)
    setSavedGroup(group)
  }

  function field(key: SavableKey, value: string) {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function uploadHeroImage(file: File) {
    setHeroImageError('')
    setUploadingHeroImage(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/hero-image/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      setUploadingHeroImage(false)
      setHeroImageError('Upload failed — please try a different file (JPEG, PNG, or WebP, under 5MB).')
      if (heroFileInputRef.current) heroFileInputRef.current.value = ''
      return
    }
    const { imagePath } = await res.json()
    await save('hero', { heroImagePath: imagePath })
    setUploadingHeroImage(false)
    if (heroFileInputRef.current) heroFileInputRef.current.value = ''
  }

  async function removeHeroImage() {
    await save('hero', { heroImagePath: null })
  }

  if (!content) return null

  return (
    <>
      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">Away / Announcement Banner</h2>
        <p className="text-sm text-charcoal/60 mb-4">
          Shows a message at the very top of every page — useful for letting clients know if you&rsquo;re away
          and when you&rsquo;ll be back.
        </p>
        <div className="flex items-start gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={content.announcementEnabled}
              onChange={(e) => setContent({ ...content, announcementEnabled: e.target.checked })}
            />
            Show banner
          </label>
          <input
            value={content.announcementMessage}
            onChange={(e) => field('announcementMessage', e.target.value)}
            placeholder="e.g. We're away until 20 September — see you soon!"
            className="flex-1 min-w-[280px] border border-sage/40 rounded px-3 py-2"
          />
          <button
            onClick={() =>
              save('announcement', {
                announcementEnabled: content.announcementEnabled,
                announcementMessage: content.announcementMessage,
              })
            }
            disabled={savingGroup === 'announcement'}
            className="bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
          >
            {savingGroup === 'announcement' ? 'Saving…' : 'Save'}
          </button>
        </div>
        {savedGroup === 'announcement' && <p className="text-sm text-sage mt-2">Saved.</p>}
      </section>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              value={content.contactEmail}
              onChange={(e) => field('contactEmail', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">WhatsApp / Phone</label>
            <input
              value={content.contactWhatsapp}
              onChange={(e) => field('contactWhatsapp', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Instagram URL</label>
            <input
              value={content.contactInstagram}
              onChange={(e) => field('contactInstagram', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">TikTok URL</label>
            <input
              value={content.contactTiktok}
              onChange={(e) => field('contactTiktok', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Facebook URL</label>
            <input
              value={content.contactFacebook}
              onChange={(e) => field('contactFacebook', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={() =>
            save('contact', {
              contactEmail: content.contactEmail,
              contactWhatsapp: content.contactWhatsapp,
              contactInstagram: content.contactInstagram,
              contactTiktok: content.contactTiktok,
              contactFacebook: content.contactFacebook,
            })
          }
          disabled={savingGroup === 'contact'}
          className="mt-4 bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {savingGroup === 'contact' ? 'Saving…' : 'Save'}
        </button>
        {savedGroup === 'contact' && <p className="text-sm text-sage mt-2">Saved.</p>}
      </section>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">Homepage Headline &amp; Photo</h2>
        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Headline</label>
            <input
              value={content.heroHeadline}
              onChange={(e) => field('heroHeadline', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Tagline</label>
            <textarea
              rows={2}
              value={content.heroTagline}
              onChange={(e) => field('heroTagline', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={() => save('hero', { heroHeadline: content.heroHeadline, heroTagline: content.heroTagline })}
          disabled={savingGroup === 'hero'}
          className="mt-4 bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {savingGroup === 'hero' ? 'Saving…' : 'Save'}
        </button>
        {savedGroup === 'hero' && <p className="text-sm text-sage mt-2">Saved.</p>}

        <div className="max-w-2xl mt-8 pt-6 border-t border-sage/20">
          <label className="block mb-1 text-sm font-medium">Homepage banner photo</label>
          <p className="text-sm text-charcoal/60 mb-3">
            Any photo works — it&rsquo;s automatically scaled and cropped to fill the banner, no
            resizing needed beforehand. Wide, landscape-oriented photos crop best; very tall or
            square photos may lose detail off the sides. Preview below shows roughly how it will
            be cropped.
          </p>

          <div className="w-full aspect-[21/9] rounded-xl2 overflow-hidden border border-sage/30 bg-cream mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.heroImagePath || '/images/hero.jpg'}
              alt="Homepage banner preview"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <input
              ref={heroFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadHeroImage(file)
              }}
              className="text-sm"
            />
            {uploadingHeroImage && <span className="text-sm text-charcoal/60">Uploading…</span>}
            {content.heroImagePath && (
              <button onClick={removeHeroImage} className="text-sm text-red-500 underline">
                Remove photo (use default)
              </button>
            )}
          </div>
          {heroImageError && <p className="text-sm text-red-600 mt-2">{heroImageError}</p>}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">About Page</h2>
        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Heading</label>
            <input
              value={content.aboutHeading}
              onChange={(e) => field('aboutHeading', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Body (separate paragraphs with a blank line)
            </label>
            <textarea
              rows={6}
              value={content.aboutBody}
              onChange={(e) => field('aboutBody', e.target.value)}
              className="w-full border border-sage/40 rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={() => save('about', { aboutHeading: content.aboutHeading, aboutBody: content.aboutBody })}
          disabled={savingGroup === 'about'}
          className="mt-4 bg-sage text-white px-6 py-2 rounded-xl2 font-medium disabled:opacity-40"
        >
          {savingGroup === 'about' ? 'Saving…' : 'Save'}
        </button>
        {savedGroup === 'about' && <p className="text-sm text-sage mt-2">Saved.</p>}
      </section>
    </>
  )
}
