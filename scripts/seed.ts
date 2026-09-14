import { createService, listServices } from '../lib/services'

const treatments: Array<Parameters<typeof createService>[0]> = [
  { name: 'HydraDermabrasion', category: 'facial', pricePence: 14000, durationMinutes: 70, active: true,
    description: 'Using advanced technology, this treatment gently resurfaces, deeply cleanses, and infuses nourishment deep into your skin — all in one soothing session, finished with an anti-aging serum infusion. Ideal for fine lines, dullness, dehydration, congested pores, and sun-damaged or uneven texture.' },
  { name: 'Botanical Skin Lift Facial', category: 'facial', pricePence: 16500, durationMinutes: 90, active: true,
    description: 'Non-surgical lifting combining advanced technology with facial massage, infused with a Korean lift serum. Lifts, sculpts, firms, and defines contours for a naturally refreshed, youthful glow — ideal for mature, sagging, tired or dry skin, and loss of firmness.' },
  { name: 'Pro Hydra-Glow Facial', category: 'facial', pricePence: 18500, durationMinutes: 90, active: true,
    description: 'Our most comprehensive facial: custom booster serums, LED light therapy, lymphatic drainage, and a Salmon DNA serum for deep repair, brightening, and de-puffing. Ideal for dull, sun-damaged, tired, uneven texture or mature skin.' },
  { name: 'Dermaplaning Glow Facial', category: 'facial', pricePence: 9000, durationMinutes: 60, active: true,
    description: 'Gently removes dead skin and fine hairs, instantly smoothing texture and helping products absorb more deeply for flawless-looking skin. Suitable for all skin types except active breakouts.' },
  { name: 'Classic Cleanse & Glow Facial', category: 'facial', pricePence: 7500, durationMinutes: 60, active: true,
    description: 'A gentle cleanse, exfoliation, massage and hydration — perfect for maintenance and balanced, fresh, healthy-looking skin. Great for normal, balanced or sensitive skin and first-time clients.' },
  { name: 'Deep Purifying Facial', category: 'facial', pricePence: 11000, durationMinutes: 60, active: true,
    description: 'Targets clogged pores, excess oil and impurities, balancing congested skin gently and effectively. Ideal for oily, combination, congested or blemish-prone skin with enlarged pores, blackheads and whiteheads.' },
  { name: 'Back Exfoliation', category: 'facial', pricePence: 4500, durationMinutes: 35, active: true,
    description: 'A deep-cleansing back treatment with exfoliation to remove dead skin cells and smooth and refresh the skin, including cleanse, exfoliation and hydration.' },
  { name: 'Brow Shape', category: 'brow', pricePence: 1800, durationMinutes: 15, active: true,
    description: 'Expertly shapes your brows using precision waxing for a clean, defined and lifted look.' },
  { name: 'Brow Tinting', category: 'brow', pricePence: 1800, durationMinutes: 15, active: true,
    description: 'Adds colour and depth to your brows with a custom tint for a natural yet fuller appearance.' },
  { name: 'Brow Tinting & Shape', category: 'brow', pricePence: 3000, durationMinutes: 20, active: true,
    description: 'Combines tinting and shaping to enhance, define and perfect your brows.' },
  { name: 'Brow Lamination', category: 'brow', pricePence: 6000, durationMinutes: 45, active: true,
    description: 'Smooths and lifts brow hairs into place for a fuller, fluffier and long-lasting finish.' },
  { name: 'Complete Brow Lamination', category: 'brow', pricePence: 7500, durationMinutes: 60, active: true,
    description: 'Lamination, tint, shaping and waxing — the ultimate all-in-one treatment for perfectly groomed brows. A patch test is required at least 24 hours before your appointment.' },
]

async function main() {
  const existing = await listServices()
  if (existing.length > 0) {
    console.log(`Services table already has ${existing.length} rows — skipping seed.`)
    return
  }
  for (const t of treatments) await createService(t)
  console.log(`Seeded ${treatments.length} services.`)
}

main()
