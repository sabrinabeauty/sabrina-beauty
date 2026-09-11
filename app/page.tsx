// app/page.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <section className="relative h-[80vh] min-h-[560px] flex items-center">
        <Image
          src="/images/hero.jpg"
          alt="Client receiving a relaxing facial treatment at Sabrina Beauty"
          fill
          priority
          className="object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-charcoal/30" />
        <div className="relative max-w-3xl mx-auto text-center text-cream px-6">
          <h1 className="font-serif text-5xl sm:text-6xl mb-6">Welcome to Sabrina Beauty</h1>
          <p className="text-lg sm:text-xl mb-8">
            Your sanctuary for luxurious, results-focused facial treatments designed to enhance your natural beauty.
          </p>
          <Link
            href="/book"
            className="inline-block bg-blush text-charcoal px-8 py-3 rounded-xl2 font-medium hover:bg-blush/90 transition-colors"
          >
            Book Your Treatment
          </Link>
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
    </>
  )
}
