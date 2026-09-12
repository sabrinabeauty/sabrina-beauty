# Deploying Sabrina Beauty

This app is a standard Next.js (App Router) site with a local SQLite database
and locally-stored uploaded images. It is **not** built for a serverless/stateless
host (Vercel, Netlify, AWS Lambda, etc.) as-is — every write (bookings, admin
content, uploaded photos) needs a real, persistent filesystem that survives
restarts and redeploys.

It will run on **any** host that gives you:
- A Node.js process you control (Node **18.18 or newer**)
- A persistent disk (not ephemeral/wiped-on-restart storage)
- The ability to set environment variables

That covers almost any VPS (DigitalOcean, Linode, Hetzner...), a managed Node
host (Render, Railway, Fly.io...), or shared hosting that supports Node apps.
Nothing in this project is tied to one platform.

## 1. What to upload

Copy the whole project folder to the server **except**:
- `node_modules/` (reinstalled on the server, see below)
- `.next/` (rebuilt on the server)
- `data/` (this is *runtime* data — see the backup note below; don't overwrite a live site's database with your local one)
- `public/uploads/` (same — runtime data, don't overwrite a live site's photos)
- `.env.local` (contains secrets — set these directly on the server instead, see step 3)

If the code lives in git, the simplest approach is: push to a repo, then
`git clone` (or `git pull`) directly on the server. Otherwise, zip the folder
(excluding the paths above) and upload it.

## 2. Install and build

On the server, in the project folder:

```bash
npm install
npm run build
```

`npm install` compiles `better-sqlite3`, a native module — this needs a C/C++
build toolchain (`build-essential` on Debian/Ubuntu, `gcc-c++`/`make` on
RHEL-based distros). Most managed Node hosts (Render, Railway, Fly.io) already
have this preinstalled; a bare VPS may need `apt install build-essential` first.

## 3. Set environment variables

One variable is required: `SESSION_SECRET` (signs admin login sessions —
without it, admin login will not work). Generate one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set the output as `SESSION_SECRET` in whatever your host uses for environment
variables (a dashboard settings panel, a `.env` the process manager loads,
etc.) — **do not** reuse your local dev value, generate a fresh one for
production, and never commit it to git.

## 4. Start the app

```bash
npm start
```

This runs `next start`, which listens on port 3000 by default, or the port in
the `PORT` environment variable if your host sets one (most managed hosts set
this automatically). `npm start` runs in the foreground — for a real deploy,
run it under a process manager so it restarts on crash/reboot, e.g.:

```bash
npm install -g pm2
pm2 start npm --name sabrina-beauty -- start
pm2 save
```

If the host doesn't front the app with its own HTTPS/domain layer, put a
reverse proxy (nginx, Caddy) in front for TLS and the real domain name —
that part is platform-specific and outside this app's scope.

## 5. First-time setup on the new server

The database and upload folders are created automatically on first write —
nothing to pre-create manually. Once the app is running:

1. Visit `https://yourdomain.com/admin` — since this is a fresh database,
   it will prompt to **set** an admin password (not log in). Set a real one.
2. Optionally seed the starting treatment menu and FAQs:
   ```bash
   npm run seed
   npm run seed-faqs
   ```
   (Products, testimonials, and gallery photos are meant to be added for
   real through the admin dashboard, not seeded with demo data.)
3. Log in at `/admin` and fill in real contact details, working hours,
   About copy, etc. from the dashboard.

## 6. Backups

The two things that make this a "real" deployment rather than a demo are
**not** in git and only exist on the server:

- `data/sabrina.db` — bookings, services, prices, FAQs, testimonials, all
  admin-entered content, and the admin password.
- `public/uploads/` — uploaded product and gallery photos.

Back these up regularly (a cron job copying both to off-server storage is
enough — there's no database server to dump, it's a single file). Losing the
server without a backup of these two paths loses all real business data.

## Moving to a different host later

Because everything lives in these two plain-filesystem paths, migrating to a
different host later is: copy `data/sabrina.db` and `public/uploads/` to the
new server, deploy the code there per steps 1–4, set a fresh `SESSION_SECRET`,
and point DNS at the new server. No database export/import step needed.
