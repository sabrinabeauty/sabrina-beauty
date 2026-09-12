// app/services/page.tsx
import Image from 'next/image'
import { listServices } from '@/lib/services'
import ServiceCard from '@/components/ServiceCard'

export const dynamic = 'force-dynamic'

export default function ServicesPage() {
  const services = listServices({ activeOnly: true })
  const facials = services.filter((s) => s.category === 'facial')
  const brows = services.filter((s) => s.category === 'brow')

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-16">Our Treatment Menu</h1>

      <section className="mb-16">
        <div className="relative h-56 rounded-xl2 overflow-hidden mb-8">
          <Image src="/images/facials.jpg" alt="Professional facial treatment in progress" fill className="object-cover" />
        </div>
        <h2 className="font-serif text-2xl mb-6">Facial Treatments</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {facials.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      <section>
        <div className="relative h-56 rounded-xl2 overflow-hidden mb-8">
          <Image src="/images/brows.jpg" alt="Professional brow shaping and tinting treatment" fill className="object-cover" />
        </div>
        <h2 className="font-serif text-2xl mb-6">Brow Treatments</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {brows.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>
    </div>
  )
}
