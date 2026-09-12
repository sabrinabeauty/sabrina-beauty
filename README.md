# Sabrina Beauty Website

Local, self-contained Next.js site for Sabrina Beauty (skincare, facials, spa treatments, and brow treatments). Rebuilt from the previous Samar Beauty site with a new "modern luxury spa" design, a custom booking system, and an admin dashboard.

## Setup

```bash
npm install
cp .env.local.example .env.local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# paste the output into .env.local as SESSION_SECRET=... (one-time; see note below)
npm run seed            # seeds the 12-item treatment menu into data/sabrina.db
npm run seed-products   # seeds 3 demo skincare products (real names/prices are placeholders)
npm run seed-faqs       # seeds the real starting FAQ list
npm run dev
```

Visit http://localhost:3000. Admin dashboard: http://localhost:3000/admin.

**Why `SESSION_SECRET` is required but the password isn't:** the admin *password* is fully
self-service — the first time anyone visits `/admin`, they're prompted to set one, stored (hashed)
in `data/sabrina.db`. `SESSION_SECRET` is different: it signs login sessions, and Next.js runs
`middleware.ts` (which checks sessions) in a separate Edge runtime from the API routes (which issue
them) — two isolated processes that share no memory. Without a real shared secret in the
environment both can read, every login would silently fail verification. It's a plain random string
with no special characters, so — unlike a bcrypt hash — there's no escaping footgun; generate it
once and forget about it.

Change the admin password anytime from the dashboard itself ("Change Admin Password"). If you ever
get locked out entirely, reset it directly:

```bash
npm run reset-admin-password -- "a-new-password"
```

Admin-uploaded product and gallery images are written to `public/uploads/` at runtime — this
requires a persistent filesystem (fine for local dev or any self-hosted/VPS/managed Node host; won't
work as-is on a stateless/serverless host like Vercel or Netlify without adding a blob storage
service).

The full admin dashboard (`/admin/dashboard`, once logged in) covers: treatment menu and pricing,
products, working hours, blocked-out dates, an away/holiday announcement banner shown site-wide,
contact details, homepage headline/tagline, About page copy, FAQs, testimonials (hidden from the
homepage until at least one is added), and a photo gallery.

## Testing

```bash
npm test
```

## Deploying

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) — this is a standard Node/Next.js app deployable to any host
that gives you a persistent filesystem (any VPS, or a managed host like Render/Railway/Fly.io). It
is **not** deployable as-is to a purely serverless host (Vercel, Netlify) because bookings, admin
content, and uploaded photos all need real disk storage that survives restarts.

## Known gaps (by design, deferred)

- Products page is a showcase/catalog only — no online payment or checkout (deliberately excluded).
- Demo product data (names, descriptions, prices, images) is placeholder — replace via the admin dashboard before launch.
- No automated email confirmations (booking shows an on-screen confirmation only).
- Working hours are used for the booking calendar but not shown publicly as an "opening hours" block.
- Contact email/phone/socials are carried over from the old site (`info@s1botanicals.co.uk`) by default — editable anytime from the admin dashboard, but need updating with the salon's real details before launch.
