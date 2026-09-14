import Image from 'next/image'
import Link from 'next/link'
import { getSiteContent } from '@/lib/settings'

export default async function HeroNew() {
  const { heroHeadline, heroTagline, heroImagePath } = await getSiteContent()
  // object-cover scales and crops any uploaded photo to fill the banner automatically,
  // regardless of its original size or aspect ratio. The default stock photo's crop was
  // tuned to a specific 25%-left focal point; a custom upload uses a safe centered crop.
  return (
    <section className="relative h-[80vh] min-h-[560px] flex items-center bg-cream">
      <Image
        src={heroImagePath || '/images/hero.jpg'}
        alt="Smiling client with radiant, glowing skin at Sabrina Beauty"
        fill
        priority
        className={`object-cover ${heroImagePath ? 'object-center' : 'object-[25%_center]'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cream/70 to-cream/95" />
      <div className="relative w-full max-w-6xl mx-auto px-6">
        <div className="max-w-md ml-auto text-right">
          <h1 className="font-serif text-5xl sm:text-6xl mb-6 text-charcoal">{heroHeadline}</h1>
          <p className="text-lg sm:text-xl mb-8 text-charcoal/80">{heroTagline}</p>
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
