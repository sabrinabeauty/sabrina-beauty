import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listServices } from '@/lib/services'
import { slugify } from '@/lib/slug'

export function generateStaticParams() {
  return listServices({ activeOnly: true }).map((s) => ({ slug: slugify(s.name) }))
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = listServices({ activeOnly: true }).find((s) => slugify(s.name) === params.slug)
  if (!service) notFound()

  const price = (service.pricePence / 100).toFixed(0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/services" className="text-sm text-sage hover:underline">
        &larr; Back to all treatments
      </Link>

      <h1 className="font-serif text-4xl mt-6 mb-4">{service.name}</h1>

      <div className="flex items-center gap-4 text-charcoal/70 mb-8">
        <span className="text-2xl font-medium text-sage">&pound;{price}</span>
        <span>&middot;</span>
        <span>{service.durationMinutes} minutes</span>
        <span>&middot;</span>
        <span className="capitalize">{service.category} treatment</span>
      </div>

      <p className="text-charcoal/80 leading-relaxed text-lg mb-12">{service.description}</p>

      <Link
        href={`/book?service=${service.id}`}
        className="inline-block bg-blush text-charcoal px-8 py-3 rounded-xl2 font-medium hover:bg-blush/90 transition-colors"
      >
        Book This Treatment
      </Link>
    </div>
  )
}
