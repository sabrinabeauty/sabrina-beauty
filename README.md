# Sabrina Beauty Website

Next.js site for Sabrina Beauty (skincare, facials, spa treatments, and brow treatments). Rebuilt from the previous Samar Beauty site with a new "modern luxury spa" design, a custom booking system, and an admin dashboard. Data lives in Vercel Postgres (Neon) and Vercel Blob — see [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full architecture and how it's hosted.

## Setup

```bash
npm install
vercel link                                          # one-time, links to the Vercel project
vercel env pull .env.local --environment=development  # pulls SESSION_SECRET, Postgres, Blob creds
npm run seed            # seeds the 12-item treatment menu
npm run seed-faqs       # seeds the real starting FAQ list
npm run dev
```

Visit http://localhost:3000. Admin dashboard: http://localhost:3000/admin.

If you don't have Vercel CLI access to this project, ask whoever set it up to share the
`.env.local` values directly instead — you need `SESSION_SECRET`, `POSTGRES_URL`, and
`BLOB_READ_WRITE_TOKEN` at minimum (see `.env.local.example` for the full list).

**Why `SESSION_SECRET` is required but the password isn't:** the admin *password* is fully
self-service — the first time anyone visits `/admin`, they're prompted to set one, stored (hashed)
in Postgres. `SESSION_SECRET` is different: it signs login sessions, and Next.js runs
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

Admin-uploaded product and gallery images are uploaded to Vercel Blob (public access) at runtime —
no local filesystem involved, which is why this app runs fine on Vercel's serverless platform.

The full admin dashboard (`/admin/dashboard`, once logged in) covers: treatment menu and pricing,
products, working hours, blocked-out dates, an away/holiday announcement banner shown site-wide,
contact details, homepage headline/tagline, About page copy, FAQs, testimonials (hidden from the
homepage until at least one is added), and a photo gallery.

## Testing

```bash
npm test
```

Tests run against a **dedicated `sabrina-beauty-test-db`** — a separate Neon database, connected
to the Vercel project's Development environment only, with a `TEST_` env var prefix. `vitest.config.ts`
redirects `@vercel/postgres`'s connection at `TEST_POSTGRES_URL` and throws if that variable is
missing, specifically so tests can never silently fall back to the real database. This isolation
matters: each test file truncates all tables in `beforeEach`, and running that against the shared
dev/preview/production database once already wiped the real seeded services, FAQs, and admin
password during this project's setup. `vitest.config.ts` also disables file-level parallelism so
test files don't stomp on each other's data mid-run within the test database.

## Deploying

See [`DEPLOYMENT.md`](./DEPLOYMENT.md). Pushing to `main` on GitHub auto-deploys via Vercel — there's
no server to manage. Includes an important note on a Next.js Data Cache gotcha with `@vercel/postgres`
that any new route/page needs to account for.

## Known gaps (by design, deferred)

- Products page is a showcase/catalog only — no online payment or checkout (deliberately excluded).
- Demo product data (names, descriptions, prices, images) is placeholder — replace via the admin dashboard before launch.
- No automated email confirmations (booking shows an on-screen confirmation only).
- Working hours are used for the booking calendar but not shown publicly as an "opening hours" block.
- Contact email/phone/socials are carried over from the old site (`info@s1botanicals.co.uk`) by default — editable anytime from the admin dashboard, but need updating with the salon's real details before launch.
