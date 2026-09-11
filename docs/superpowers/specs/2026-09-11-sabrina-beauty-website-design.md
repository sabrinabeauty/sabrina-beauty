# Sabrina Beauty Website — Design Spec

Date: 2026-09-11

## Background

Sabrina Beauty (currently trading as "Samar Beauty" at samarbeauty.co.uk, legal entity S1 Botanicals Ltd, company no. 17182720) is a real skincare/spa salon offering facials and brow treatments. The business is rebranding from Samar Beauty to Sabrina Beauty and wants a new, more professional website to replace its current Webador-template site.

This is a real client project. The site must be built locally, at zero cost, fully self-contained, so it can later be handed to a hosting vendor of the salon's choosing.

## Scope

**In scope (this build):**
- Public marketing site: Home, Services, About, Contact
- Custom appointment booking flow (no online payment)
- Password-protected admin page: manage bookings, services, and date availability
- New visual identity ("modern luxury spa" look) including a wordmark-style logo treatment
- Content migrated from the current samarbeauty.co.uk site

**Explicitly deferred (not this build):**
- Product sales / e-commerce checkout
- Automated email confirmations (would require a paid/third-party email service)
- Physical address / opening hours (not available — not currently published anywhere)
- Multiple admin accounts / roles
- Production hosting, domain, and branded email (info@s1botanicals.co.uk stays as contact email for now)

## Architecture

- **Stack:** Next.js (React) + SQLite, single self-contained codebase — same pattern as the `khando-job-portal` project.
- **Local-only:** runs via `npm run dev`, zero cost, no external accounts or paid services required.
- **Portability:** Next.js runs on virtually any modern Node-capable host (Vercel, Netlify, Render, etc.), so the app can be handed to a hosting vendor later with minimal rework. SQLite can be swapped for a hosted Postgres/MySQL at that point if the vendor requires it.
- No secrets or paid API keys required for the core build.

## Content Migrated From Current Site

Source: https://www.samarbeauty.co.uk — full site crawled and cross-checked 2026-09-11 against `/sitemap.xml`, which confirms exactly 4 pages exist (Home, Brows & Facials Treatments, About, Book Online). No other pages, shop/product pages, blog, or gift-card pages exist on the current site.

**Tagline:** "Your sanctuary for luxurious, results-focused facial treatments designed to enhance your natural beauty"

**Home page copy (verbatim):**
- Heading: "Welcome to Sabrina beauty"
- "At Sabrina beauty, we combine carefully selected vegan botanicals with deep hydration and expert skincare techniques to support healthy, radiant-looking skin. Each treatment is thoughtfully tailored to your individual skin needs, creating a relaxing experience while helping you achieve a fresh, natural glow."
- "Discover your most radiant self with sabrina beauty"
- Section heading: "Where Glowing Skin Begins"
- "At Sabrina beauty, we believe skincare should nourish both your skin and your confidence. We carefully choose vegan, cruelty-free, plant-powered products to support healthy, radiant-looking skin while respecting nature"
- Brand attributes strip: "Vegan • Cruelty-Free • Professional Care"

**About page copy (verbatim):**
- Heading: "Our story, your glow"
- "Sabrina beauty was born from a passion for skincare and a belief that beautiful skin begins with thoughtful, personalised care."
- "Our approach combines carefully selected botanical ingredients with professional skincare techniques to nourish, refresh and enhance your skin's natural radiance."
- "Every treatment is designed with care, creating a relaxing experience that leaves your skin feeling" — sentence is cut off/incomplete on the current site; will need finishing copy for the new site (flagged below).
- No founder bio, credentials, or formal mission statement exist on the current site beyond the above.

**Facial treatments** (all copy verbatim from current site):
| Treatment | Price | Duration | Description | Best for |
|---|---|---|---|---|
| HydraDermabrasion | £140 | 70 min | "Using advanced technology, this treatment gently resurfaces, deeply cleanses, and infuses nourishment deep into your skin — all in one soothing session." Anti-Aging serum. | Fine lines & dullness, dry or dehydrated skin, oily & congested pores, sun-damaged or uneven texture |
| Botanical Skin Lift Facial | £165 | 90 min | "Non-surgical lifting combining advanced technology with facial massage. Lifts, sculpts, firms, and defines contours for a naturally refreshed, youthful glow." Korean lift serum. | Mature, sagging, tired or dry skin, loss of firmness, fine lines |
| Pro Hydra-Glow Facial | £185 | 90 min | "Everything in Deluxe + custom booster serums, LED light therapy, and lymphatic drainage. Deep repair, brightening, and de-puffing." Salmon DNA serum. | Dull, sun-damaged, tired, uneven texture or mature skin |
| Dermaplaning Glow Facial | £90 | 60 min | "Gently removes dead skin and fine hairs. Instantly smooths texture, helps products absorb deeply, leaves skin flawless." | Dull, dry, uneven texture, all skin types except active breakouts |
| Classic Cleanse & Glow Facial | £75 | 60 min | "Gentle cleanse, exfoliation, massage and hydration. Perfect for maintenance — balanced, fresh, healthy skin." | Normal, balanced or sensitive skin, first-time clients, regular maintenance |
| Deep Purifying Facial | £110 | 60 min | "Targets clogged pores, excess oil and impurities. Balances congested skin gently and effectively." | Oily, combination, congested or blemish-prone skin, enlarged pores, excess oil, blackheads & whiteheads |
| Back Exfoliation | £45 | 35 min | "A deep cleansing back treatment with exfoliation to remove dead skin cells, smooth and refresh the skin. Includes cleanse, exfoliation and hydration." | — |

Note: "Pro Hydra-Glow Facial" copy references "Everything in Deluxe" — the current site does not actually have a treatment named "Deluxe," so this is a leftover/inconsistency in the source content. The new site should rewrite this line to stand alone rather than copying the dangling reference.

**Brow treatments** (all copy verbatim from current site):
| Treatment | Price | Duration | Description |
|---|---|---|---|
| Brow Shape | £18 | 15 min | "Expertly shapes your brows using precision waxing for a clean, defined and lifted look." |
| Brow Tinting | £18 | 15 min | "Adds colour and depth to your brows with a custom tint for a natural yet fuller appearance." |
| Brow Tinting & Shape | £30 | 20 min | "Combines tinting and shaping to enhance, define and perfect your brows." |
| Brow Lamination | £60 | 45 min | "Smooths and lifts brow hairs into place for a fuller, fluffier and long-lasting finish." |
| Complete Brow Lamination | £75 | 60 min | "LAMINATION + TINT + SHAPING + WAXING. The ultimate all-in-one treatment for perfectly groomed brows." **Patch test required at least 24 hours before appointment.** |

**Book Online page copy (verbatim):**
- Heading: "Book your pampering facial online"
- "Booking your facial with Botanical Essence is simple. Choose your treatment, pick a convenient date and time, and leave the rest to us. Enjoy a clean, relaxing journey toward healthier skin and a radiant, natural glow." (Note: source text still refers to the old "Botanical Essence" name in places — another inconsistency on the current site, to be fully replaced with "Sabrina Beauty" on the new site.)
- Booking process steps: 1) "Choose your desired facial treatment." 2) "Select your preferred date and time." 3) "Fill in a simple form with your details." 4) "Confirm your appointment for a radiant glow!"
- A section headed "Our location" exists but contains no address/map — only social links and the company registration line. Confirms no physical address exists anywhere on the site.
- No cancellation policy, rescheduling policy, deposit/payment terms, or formal T&Cs appear anywhere on the current site.

**Contact info (to carry over as-is):**
- Email: info@s1botanicals.co.uk
- WhatsApp/phone: +44 7494 700707 (wa.me link)
- Instagram: instagram.com/Sabrinabeauty.studioo
- TikTok: tiktok.com/@botanicalessence7
- Facebook: facebook.com/Sabrinabeauty7
- No physical address or opening hours published anywhere on the current site — omit from new site.
- Footer on every page: "S1 Botanicals Ltd 17182720" / "Powered by Webador" (the Webador attribution is not carried over — it's the current site builder's own branding, not the salon's).

Decision: keep the existing contact email/phone for now; the salon will update these later once rebranded contact details exist.

**Flag:** the About page's final sentence is cut off mid-thought on the current site ("...leaves your skin feeling"). The new site needs original finishing copy here rather than a literal migration, since there's nothing further to copy.

## Pages

1. **Home** — hero with new "Sabrina Beauty" branding, tagline, brand story snippet, featured treatments, CTA to book.
2. **Services** — full treatment menu above (Facials + Brows), each with price/duration/description.
3. **About** — expanded bio/philosophy built on the current brand text.
4. **Book Online** — booking flow (see below).
5. **Contact** — email, WhatsApp, social links (no address/hours).
6. **Admin** (not in public nav, password-protected) — bookings, services, availability management.

## Booking System

- Client flow: choose treatment → view available time slots → enter name/email/phone → confirm. No payment collected.
- Availability model: fixed working hours per weekday, with admin-managed blocked dates/times.
- Data model (SQLite):
  - `services`: id, name, category (facial/brow), description, price, duration_minutes, active
  - `bookings`: id, service_id, client_name, client_email, client_phone, date, time, status (pending/confirmed/cancelled)
  - `blocked_slots`: id, date, time (or full-day flag)
- No automated email confirmations at launch — booking shows an on-screen confirmation only. Flagged as a future enhancement once a paid/free-tier email provider is set up.
- Booking must prevent double-booking the same slot.

## Admin

- Single shared password (hashed, stored as a local env var — not committed to git).
- Views: upcoming bookings list (mark confirmed/done/cancelled), service list (add/edit/deactivate, edit price/duration/description), blocked-date management.

## Visual Design

Direction: **modern luxury spa** — a clear step up from the current generic Webador template.
- Palette: warm off-white base, muted sage/blush accents, deep charcoal for contrast/text.
- Typography: elegant serif for headings, clean sans-serif for body copy.
- Layout: large full-bleed imagery, generous whitespace, considered hierarchy and spacing, subtle rounded edges.
- Logo: no existing logo — design a simple wordmark/logotype treatment for "Sabrina Beauty" (not a complex icon-based mark).

## Testing

Per standing rule, every feature needs a passing test before it's considered done:
- Booking flow: creating a booking succeeds; booking an already-taken slot is rejected.
- Admin auth: unauthenticated access to `/admin` is blocked; correct password grants access.
- Service management: admin can create/edit/deactivate a service and it reflects correctly on the public Services page.

## Open Items / Flags

- Contact email (`info@s1botanicals.co.uk`) and phone are being kept temporarily; salon will provide rebranded contact details later.
- No physical address or opening hours exist yet — add once available.
- Product sales, email confirmations, and production hosting are explicitly out of scope for this build.
