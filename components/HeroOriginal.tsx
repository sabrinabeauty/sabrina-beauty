import Image from 'next/image'
import Link from 'next/link'
import { getSiteContent } from '@/lib/settings'

export default function HeroOriginal() {
  const { heroHeadline, heroTagline } = getSiteContent()
  return (
    <section className="relative h-[80vh] min-h-[560px] flex items-center">
      <Image
        src="/images/hero-original.jpg"
        alt="Client receiving a relaxing facial treatment at Sabrina Beauty"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-charcoal/30" />
      <div className="relative max-w-3xl mx-auto text-center text-cream px-6">
        <h1 className="font-serif text-5xl sm:text-6xl mb-6">{heroHeadline}</h1>
        <p className="text-lg sm:text-xl mb-8">{heroTagline}</p>
        <Link
          href="/book"
          className="inline-block bg-sage text-white px-8 py-3 rounded-xl2 font-medium hover:bg-sage/90 transition-colors"
        >
          Book Your Treatment
        </Link>
      </div>
    </section>
  )
}
