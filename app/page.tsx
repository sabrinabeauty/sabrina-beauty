// app/page.tsx
import Link from 'next/link'
import InstagramFollow from '@/components/InstagramFollow'
import TestimonialsSection from '@/components/TestimonialsSection'
import HeroOriginal from '@/components/HeroOriginal'
import HeroNew from '@/components/HeroNew'
import { getHomepageVariant } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const variant = getHomepageVariant()

  return (
    <>
      {variant === 'original' ? <HeroOriginal /> : <HeroNew />}

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

      <TestimonialsSection />

      <InstagramFollow />
    </>
  )
}
