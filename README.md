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

Admin-uploaded product images are written to `public/uploads/products/` at runtime — this requires
a persistent filesystem (fine for local dev or a self-hosted Node server; won't work as-is on a
stateless/serverless host without adding a blob storage service).

## Testing

```bash
npm test
```

## Deploying later

This is a standard Next.js app — deployable to any Node-capable host (Vercel, Netlify, Render, etc.).
Swap `data/sabrina.db` (SQLite) for a hosted database if the target host requires it; the data-access
functions in `lib/services.ts` and `lib/bookings.ts` are the only places that would need updating.

## Known gaps (by design, deferred)

- Products page is a showcase/catalog only — no online payment or checkout.
- Demo product data (names, descriptions, prices, images) is placeholder — replace via the admin dashboard before launch.
- No automated email confirmations (booking shows an on-screen confirmation only).
- No physical address or opening hours shown — none exist yet for the business.
- Contact email/phone are carried over from the old site (`info@s1botanicals.co.uk`) until the salon has rebranded contact details.
