import Image from 'next/image'
import Link from 'next/link'
import { getSiteContent } from '@/lib/settings'

export default async function HeroNew() {
  const { heroHeadline, heroTagline, heroImagePath } = await getSiteContent()
  // object-cover scales and crops any uploaded photo to fill the banner automatically,
  // regardless of its original size or aspect ratio. The default stock photo's crop was
  // tuned to a specific 25%-left focal point that keeps her face in frame at any viewport
  // width; a custom upload's composition is unknown, so it keeps a safe centered crop.
  return (
    <section className="relative h-[80vh] min-h-[560px] flex items-end sm:items-center bg-cream">
      <Image
        src={heroImagePath || '/images/hero.jpg'}
        alt="Smiling client with radiant, glowing skin at Sabrina Beauty"
        fill
        priority
        className={`object-cover ${heroImagePath ? 'object-center' : 'object-[25%_center]'}`}
      />
      {/* Desktop keeps the original edge-to-edge gradient scrim — it already clears to opaque
          well before the right-aligned text starts at that width, so the photo stays vivid. */}
      <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-cream/70 to-cream/95" />
      {/* On mobile the full photo (face included) is visible top-to-bottom, so the text card
          sits low, over her chest/shoulder area, keeping her face uncovered above it. */}
      <div className="relative w-full max-w-6xl mx-auto px-6 pb-10 sm:pb-0">
        <div className="max-w-md ml-auto text-right bg-cream/85 backdrop-blur-md rounded-xl2 px-6 py-6 sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0">
          <h1 className="font-serif text-4xl sm:text-6xl mb-4 sm:mb-6 text-charcoal [text-shadow:0_1px_12px_rgba(246,210,210,0.8)] sm:[text-shadow:none]">
            {heroHeadline}
          </h1>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 text-charcoal/80">{heroTagline}</p>
          <Link
            href="/book"
            className="inline-block bg-sage text-white px-8 py-3 rounded-xl2 font-medium hover:bg-sage/90 transition-colors"
          >
            Book Your Treatment
          </Link>
        </div>
      </div>
    </section>
  )
}
