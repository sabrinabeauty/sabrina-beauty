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

Source: https://www.samarbeauty.co.uk (crawled 2026-09-11)

**Tagline:** "Your sanctuary for luxurious, results-focused facial treatments"

**Brand philosophy:** Vegan, cruelty-free, "plant-powered skincare philosophy," combines "carefully selected botanical ingredients with professional skincare techniques to nourish, refresh and enhance your skin's natural radiance." Treatments are "thoughtfully tailored to your individual skin needs."

**Facial treatments:**
| Treatment | Price | Duration | Notes |
|---|---|---|---|
| HydraDermabrasion | £140 | 70 min | Six-step resurfacing + anti-aging serum infusion; fine lines, dullness, dehydration, congestion, sun damage |
| Botanical Skin Lift Facial | £165 | 90 min | Non-surgical lift + Korean lift serum; mature/sagging/tired skin |
| Pro Hydra-Glow Facial | £185 | 90 min | Booster serums, LED light therapy, lymphatic drainage, Salmon DNA serum; dull/sun-damaged/mature skin |
| Dermaplaning Glow Facial | £90 | 60 min | Removes dead skin/fine hairs; all skin types except active breakouts |
| Classic Cleanse & Glow Facial | £75 | 60 min | Maintenance facial; balanced/sensitive skin, first-timers |
| Deep Purifying Facial | £110 | 60 min | Extractions, oil/impurity control; oily/combination/blemish-prone skin |
| Back Exfoliation | £45 | 35 min | Deep-cleansing back treatment |

**Brow treatments:**
| Treatment | Price | Duration | Notes |
|---|---|---|---|
| Brow Shape | £18 | 15 min | Precision waxing |
| Brow Tinting | £18 | 15 min | Custom tint |
| Brow Tinting & Shape | £30 | 20 min | Combined |
| Brow Lamination | £60 | 45 min | Smooths/lifts for fuller finish |
| Complete Brow Lamination | £75 | 60 min | Lamination + tint + shaping + waxing; 24hr patch test required |

**Contact info (to carry over as-is):**
- Email: info@s1botanicals.co.uk
- WhatsApp/phone: +44 7494 700707 (wa.me link)
- Instagram: instagram.com/Sabrinabeauty.studioo
- TikTok: tiktok.com/@botanicalessence7
- Facebook: facebook.com/Sabrinabeauty7
- No physical address or opening hours published — omit from new site.

Decision: keep the existing contact email/phone for now; the salon will update these later once rebranded contact details exist.

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
