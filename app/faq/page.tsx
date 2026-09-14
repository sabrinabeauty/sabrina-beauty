import { listFaqs } from '@/lib/faqs'

export default async function FaqPage() {
  const faqs = await listFaqs()

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-4">Frequently Asked Questions</h1>
      <p className="text-center text-charcoal/70 mb-12">
        Everything you need to know before your visit. Can&rsquo;t find what you&rsquo;re looking for? Reach out to us directly — details are in the footer below.
      </p>

      <div className="space-y-8">
        {faqs.map((item) => (
          <div key={item.id} className="border-b border-sage/20 pb-8">
            <h2 className="font-serif text-xl mb-2">{item.question}</h2>
            <p className="text-charcoal/80 leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
