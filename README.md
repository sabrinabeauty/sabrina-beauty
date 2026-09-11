# Sabrina Beauty Website

Local, self-contained Next.js site for Sabrina Beauty (skincare, facials, spa treatments, and brow treatments). Rebuilt from the previous Samar Beauty site with a new "modern luxury spa" design, a custom booking system, and an admin dashboard.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run hash-password -- "your-chosen-admin-password"
# paste the printed hash into .env.local as ADMIN_PASSWORD_HASH
```

**Important:** the bcrypt hash contains literal `$` characters (e.g. `$2b$10$...`). Next.js expands `$VAR`-style references in `.env` files, which will silently corrupt an unescaped hash and break admin login. Escape every `$` as `\$` in `.env.local`, e.g.:

```
ADMIN_PASSWORD_HASH=\$2b\$10\$XUWTFjp.zibJJMsa/Js9R.IsNqk.VqYSxUwuvpR/snZl/NXsZRaua
SESSION_SECRET=some-long-random-string
```

Then seed the treatment menu and start the dev server:

```bash
npm run seed   # seeds the 12-item treatment menu into data/sabrina.db
npm run dev
```

Visit http://localhost:3000. Admin dashboard: http://localhost:3000/admin.

## Testing

```bash
npm test
```

## Deploying later

This is a standard Next.js app — deployable to any Node-capable host (Vercel, Netlify, Render, etc.).
Swap `data/sabrina.db` (SQLite) for a hosted database if the target host requires it; the data-access
functions in `lib/services.ts` and `lib/bookings.ts` are the only places that would need updating.

## Known gaps (by design, deferred)

- No online payment / product sales.
- No automated email confirmations (booking shows an on-screen confirmation only).
- No physical address or opening hours shown — none exist yet for the business.
- Contact email/phone are carried over from the old site (`info@s1botanicals.co.uk`) until the salon has rebranded contact details.
