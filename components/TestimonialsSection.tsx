import { listTestimonials } from '@/lib/testimonials'

export default function TestimonialsSection() {
  const testimonials = listTestimonials({ activeOnly: true })
  if (testimonials.length === 0) return null

  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="font-serif text-3xl text-center mb-12">What Clients Say</h2>
      <div className="grid gap-8 sm:grid-cols-2">
        {testimonials.map((t) => (
          <div key={t.id} className="border border-sage/30 rounded-xl2 p-6 bg-white/60">
            <p className="text-charcoal/80 leading-relaxed italic mb-3">&ldquo;{t.quote}&rdquo;</p>
            <p className="text-sm text-sage font-medium">— {t.clientName}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
