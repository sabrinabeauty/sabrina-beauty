// app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import InstagramFollow from '@/components/InstagramFollow'

export default function HomePage() {
  return (
    <>
      <section className="relative h-[80vh] min-h-[560px] flex items-center bg-cream">
        <Image
          src="/images/hero.jpg"
          alt="Smiling client with radiant, glowing skin at Sabrina Beauty"
          fill
          priority
          className="object-cover object-[25%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cream/70 to-cream/95" />
        <div className="relative w-full max-w-6xl mx-auto px-6">
          <div className="max-w-md ml-auto text-right">
            <h1 className="font-serif text-5xl sm:text-6xl mb-6 text-charcoal">Welcome to Sabrina Beauty</h1>
            <p className="text-lg sm:text-xl mb-8 text-charcoal/80">
              Your sanctuary for luxurious, results-focused facial treatments designed to enhance your natural beauty.
            </p>
            <Link
              href="/book"
              className="inline-block bg-blush text-charcoal px-8 py-3 rounded-xl2 font-medium hover:bg-blush/90 transition-colors"
            >
              Book Your Treatment
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl mb-6">Where Glowing Skin Begins</h2>
        <p className="text-charcoal/80 leading-relaxed">
          At Sabrina Beauty, we combine carefully selected vegan botanicals with deep hydration and expert skincare
          techniques to support healthy, radiant-looking skin. Each treatment is thoughtfully tailored to your
          individual skin needs, creating a relaxing experience while helping you achieve a fresh, natural glow.
        </p>
        <p className="mt-6 text-sage font-medium tracking-wide uppercase text-sm">
          Vegan &bull; Cruelty-Free &bull; Professional Care
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 text-center">
        <Link href="/services" className="underline underline-offset-4 hover:text-sage">
          Explore our full treatment menu &rarr;
        </Link>
      </section>

      <InstagramFollow />
    </>
  )
}
