import { createFaq, listFaqs } from '../lib/faqs'

const faqs: Array<Parameters<typeof createFaq>[0]> = [
  {
    sortOrder: 0,
    question: 'How do I book an appointment?',
    answer:
      'Use our online booking page — choose your treatment, pick a date and time that suits you, and fill in your details. A member of the team may follow up by phone or email to confirm your appointment.',
  },
  {
    sortOrder: 1,
    question: 'Are your products vegan and cruelty-free?',
    answer:
      'Yes. We choose vegan, cruelty-free, plant-powered botanical products for every treatment, to support healthy, radiant-looking skin while respecting nature.',
  },
  {
    sortOrder: 2,
    question: 'Do I need a patch test before my treatment?',
    answer:
      'A patch test is required at least 24 hours before a Complete Brow Lamination appointment. If you have sensitive skin or haven’t had a particular product or treatment with us before, feel free to ask us about a patch test when you book.',
  },
  {
    sortOrder: 3,
    question: 'How should I prepare for a facial?',
    answer:
      'As general guidance: avoid strong active ingredients (like retinoids or exfoliating acids) and excessive sun exposure in the 24–48 hours beforehand, and arrive with a clean face where possible. If you have any specific skin concerns, let us know before your treatment.',
  },
  {
    sortOrder: 4,
    question: 'I need to change or cancel my appointment — what do I do?',
    answer: 'Just get in touch with us directly by WhatsApp or email (details below) as soon as you can, and we’ll help sort out a new time.',
  },
  {
    sortOrder: 5,
    question: 'Do you take online payments?',
    answer: 'Not currently — bookings are confirmed online, with payment taken in person at your appointment.',
  },
]

async function main() {
  const existing = await listFaqs()
  if (existing.length > 0) {
    console.log(`FAQs table already has ${existing.length} rows — skipping seed.`)
    return
  }
  for (const f of faqs) await createFaq(f)
  console.log(`Seeded ${faqs.length} FAQs.`)
}

main()
