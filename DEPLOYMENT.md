# Deploying Sabrina Beauty

This app is a standard Next.js (App Router) site backed by **Vercel Postgres**
(Neon) for data and **Vercel Blob** for uploaded photos — both provisioned
directly from the Vercel dashboard on their free tiers. It's deployed via
GitHub + Vercel: push to `main`, Vercel builds and deploys automatically.

There is no local database file and no local upload folder in production —
everything lives in the two hosted services above, so the app is safe to run
on Vercel's serverless platform (no persistent disk needed).

## Live setup (already done for this project)

- **GitHub**: `github.com/sabrinabeauty/sabrina-beauty` (**public** repo — required
  because Vercel's Hobby/free plan blocks deploys from commit authors who aren't a
  recognized collaborator on a *private* repo, and adding paid team members isn't
  supported on Hobby either. No secrets are ever committed — they all live in
  `.env.local`, which is gitignored — so there's no security risk in the source
  itself, only visibility of the code.)
- **Vercel project**: `sabrina-beauty`, under the `Sabrina` team
- **Postgres**: `sabrina-beauty-db` (Neon, free tier, London region), connected
  to Production, Preview, and Development environments — this is the real,
  live database
- **Test Postgres**: `sabrina-beauty-test-db` (Neon, free tier, London region),
  connected to the **Development environment only**, with env vars prefixed
  `TEST_` (e.g. `TEST_POSTGRES_URL`) so they never collide with the real ones.
  `npm test` TRUNCATEs every table in this database on every run — it must never
  point at `sabrina-beauty-db`
- **Blob store**: `sabrina-beauty-blob` (public access, since product/gallery
  photos need to be viewable directly), connected to all three environments
- **Env vars**: `SESSION_SECRET` (set manually, Production + Preview) plus the
  `POSTGRES_*` / `DATABASE_URL*`, `TEST_POSTGRES_*`, and `BLOB_*` vars (added
  automatically when the storage was connected)

## Deploying changes

Once the domain is connected and this is genuinely live, shipping a change is:

```bash
git push origin main
```

Vercel picks up the push, builds, and deploys automatically — no manual
steps, no server to SSH into. Preview deployments happen the same way for
any other branch/PR.

## First-time setup on a fresh environment

The database schema and Blob store don't need manual setup — the app creates
tables on first request (`ensureSchema()` in `lib/db.ts`). Once deployed:

1. Visit `/admin` — on a fresh database this prompts to **set** an admin
   password (not log in). Set a real one.
2. Optionally seed the starting treatment menu and FAQs (run locally, pointed
   at the target environment's Postgres via `vercel env pull`):
   ```bash
   npm run seed
   npm run seed-faqs
   ```
   (Products, testimonials, and gallery photos are meant to be added for real
   through the admin dashboard, not seeded with demo data.)
3. Log in at `/admin` and fill in real contact details, working hours, About
   copy, etc.

## Local development against the real (dev) database

```bash
vercel link          # one-time, links this folder to the Vercel project
vercel env pull .env.local --environment=development
npm install
npm run dev
```

`.env.local` is gitignored — never commit it. The `development` environment
in Vercel points at the same Neon database as Preview/Production but is a
separate connection scope, so local dev writes don't collide with anything
live.

## A caching gotcha worth knowing about

Next.js's Data Cache will silently cache the `fetch()` calls that
`@vercel/postgres` makes under the hood to Neon's HTTP endpoint — even on a
route with `dynamic = 'force-dynamic'` — because the route itself doesn't call
a Next "dynamic function" like `cookies()`. Left unfixed, this makes admin
edits look like they "didn't save": the write succeeds, but the next read
serves a stale cached response instead of hitting Postgres again.

Every route and the root layout in this project set
`export const fetchCache = 'force-no-store'` specifically to prevent this. If
you add a new API route or Server Component that reads from the database,
carry that export over — it's not optional, it's the fix for a real bug that
was caught during this migration (bookings and other admin data appeared to
vanish after being created, until this was added everywhere).

## Backups

Neon Postgres and Vercel Blob are the source of truth — there's no
local-filesystem backup step needed the way a self-hosted SQLite setup would
require. Neon's free tier includes point-in-time recovery within its
retention window; check the Neon/Vercel Storage dashboard for current limits
if this ever needs restoring.

## Domain

`sabrinabeauty.uk` is registered at Fasthosts. To go live, add the domain in
the Vercel project's **Settings → Domains**, then set the DNS records Vercel
provides at Fasthosts (typically an `A` record for the apex domain and a
`CNAME` for `www`). The old site (`samarbeauty.co.uk`, hosted on Webador)
is left untouched and independent — no redirect between the two unless
explicitly decided later.
