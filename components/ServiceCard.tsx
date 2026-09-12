// components/ServiceCard.tsx
import Link from 'next/link'
import type { Service } from '@/lib/services'
import { slugify } from '@/lib/slug'

export default function ServiceCard({ service }: { service: Service }) {
  const price = (service.pricePence / 100).toFixed(0)
  return (
    <Link
      href={`/services/${slugify(service.name)}`}
      className="block border border-sage/30 rounded-xl2 p-6 bg-white/60 hover:border-sage hover:shadow-sm transition-all"
    >
      <div className="flex justify-between items-baseline mb-2">
        <h3 className="font-serif text-xl">{service.name}</h3>
        <span className="font-medium text-sage">&pound;{price}</span>
      </div>
      <p className="text-sm text-charcoal/60 mb-3">{service.durationMinutes} minutes</p>
      <p className="text-charcoal/80 leading-relaxed">{service.description}</p>
    </Link>
  )
}
