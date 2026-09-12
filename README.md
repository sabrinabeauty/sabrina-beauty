# Sabrina Beauty Website

Local, self-contained Next.js site for Sabrina Beauty (skincare, facials, spa treatments, and brow treatments). Rebuilt from the previous Samar Beauty site with a new "modern luxury spa" design, a custom booking system, and an admin dashboard.

## Setup

```bash
npm install
npm run seed            # seeds the 12-item treatment menu into data/sabrina.db
npm run seed-products   # seeds 3 demo skincare products (real names/prices are placeholders)
npm run dev
```

Visit http://localhost:3000. Admin dashboard: http://localhost:3000/admin.

**No password is pre-configured.** The first time anyone visits `/admin`, they're prompted to set
one — it's stored (hashed) in `data/sabrina.db`, not in an env file, so there's nothing to
hand-configure or accidentally corrupt. It can be changed later from the dashboard itself
("Change Admin Password"). If you ever get locked out entirely, reset it directly:

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
