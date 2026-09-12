import Image from 'next/image'
import { listGalleryImages } from '@/lib/gallery'

export default function GalleryPage() {
  const images = listGalleryImages({ activeOnly: true })

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-4">Gallery</h1>
      <p className="text-center text-charcoal/70 mb-16">A look at our results and treatments.</p>

      {images.length === 0 ? (
        <p className="text-center text-charcoal/60">Our gallery is coming soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="rounded-xl2 overflow-hidden border border-sage/30 bg-white/60">
              <div className="relative h-64">
                <Image src={img.imagePath} alt={img.caption ?? 'Gallery image'} fill className="object-cover" />
              </div>
              {img.caption && <p className="p-4 text-sm text-charcoal/70">{img.caption}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
