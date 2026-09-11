// app/about/page.tsx
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-12">Our Story, Your Glow</h1>
      <div className="relative h-72 rounded-xl2 overflow-hidden mb-12">
        <Image src="/images/about.jpg" alt="Calm, minimal spa treatment room" fill className="object-cover" />
      </div>
      <div className="space-y-6 text-charcoal/80 leading-relaxed text-lg">
        <p>
          Sabrina Beauty was born from a passion for skincare and a belief that beautiful skin begins with
          thoughtful, personalised care.
        </p>
        <p>
          Our approach combines carefully selected botanical ingredients with professional skincare techniques to
          nourish, refresh and enhance your skin&rsquo;s natural radiance.
        </p>
        <p>
          Every treatment is designed with care, creating a relaxing experience that leaves your skin feeling
          nourished, renewed, and glowing from within &mdash; and you feeling calm, cared for, and confident.
        </p>
        <p className="text-sage font-medium tracking-wide uppercase text-sm pt-4">
          Vegan &bull; Cruelty-Free &bull; Professional Care
        </p>
      </div>
    </div>
  )
}
