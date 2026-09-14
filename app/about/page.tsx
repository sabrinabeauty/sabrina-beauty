// app/about/page.tsx
import Image from 'next/image'
import { getSiteContent } from '@/lib/settings'

export default async function AboutPage() {
  const { aboutHeading, aboutBody } = await getSiteContent()
  const paragraphs = aboutBody.split('\n\n').filter(Boolean)

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-12">{aboutHeading}</h1>
      <div className="relative h-72 rounded-xl2 overflow-hidden mb-12">
        <Image src="/images/about.jpg" alt="Calm, minimal spa treatment room" fill className="object-cover" />
      </div>
      <div className="space-y-6 text-charcoal/80 leading-relaxed text-lg">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className="text-sage font-medium tracking-wide uppercase text-sm pt-4">
          Vegan &bull; Cruelty-Free &bull; Professional Care
        </p>
      </div>
    </div>
  )
}
