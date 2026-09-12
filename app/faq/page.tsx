const FAQS = [
  {
    q: 'How do I book an appointment?',
    a: 'Use our online booking page — choose your treatment, pick a date and time that suits you, and fill in your details. A member of the team may follow up by phone or email to confirm your appointment.',
  },
  {
    q: 'Are your products vegan and cruelty-free?',
    a: 'Yes. We choose vegan, cruelty-free, plant-powered botanical products for every treatment, to support healthy, radiant-looking skin while respecting nature.',
  },
  {
    q: 'Do I need a patch test before my treatment?',
    a: 'A patch test is required at least 24 hours before a Complete Brow Lamination appointment. If you have sensitive skin or haven’t had a particular product or treatment with us before, feel free to ask us about a patch test when you book.',
  },
  {
    q: 'How should I prepare for a facial?',
    a: 'As general guidance: avoid strong active ingredients (like retinoids or exfoliating acids) and excessive sun exposure in the 24–48 hours beforehand, and arrive with a clean face where possible. If you have any specific skin concerns, let us know before your treatment.',
  },
  {
    q: 'I need to change or cancel my appointment — what do I do?',
    a: 'Just get in touch with us directly by WhatsApp or email (details below) as soon as you can, and we’ll help sort out a new time.',
  },
  {
    q: 'Do you take online payments?',
    a: 'Not currently — bookings are confirmed online, with payment taken in person at your appointment.',
  },
]

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-4">Frequently Asked Questions</h1>
      <p className="text-center text-charcoal/70 mb-12">
        Everything you need to know before your visit. Can&rsquo;t find what you&rsquo;re looking for? Reach out to us directly — details are in the footer below.
      </p>

      <div className="space-y-8">
        {FAQS.map((item) => (
          <div key={item.q} className="border-b border-sage/20 pb-8">
            <h2 className="font-serif text-xl mb-2">{item.q}</h2>
            <p className="text-charcoal/80 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
