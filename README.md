# SKC Admin

Staff dashboard for Swahili Komik Con — influencer management, referral-code
generation, and redemption tracking. This is a separate app from the public
website ([`swahili-komikcon`](../swahili-komikcon)), deployed on its own
domain (e.g. `admin.swahilikomikcon.com`) so the admin surface and its
Supabase Auth session never touch the public site's origin.

Both apps talk to the **same Supabase project** — run the schema migration
once, and both apps will work against it.

## Stack

Next.js (App Router, TypeScript) · Supabase (Postgres, Auth, Row Level
Security) · Tailwind CSS v4.

## 1. Set up Supabase

If you haven't already run it for the public website, apply the schema:

1. Create a project at [supabase.com](https://supabase.com) (or reuse the
   website's project).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql`. This is the
   same migration as the website repo — it's duplicated here so this repo is
   self-contained, but only needs to be run once per Supabase project.
3. Copy **Project Settings → API** into `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY`. Set `NEXT_PUBLIC_WEBSITE_URL` to wherever the
   public site is running (e.g. `http://localhost:3202` locally).

## 2. Create your first admin user

Admin accounts aren't self-service by design:

```bash
node --env-file=.env.local scripts/create-admin.mjs "you@skc.com" "a-strong-password" "Your Name" platform_admin
```

## 3. Run it

```bash
npm install
npm run dev
```

Visit `http://localhost:3203` (or whatever port you run it on) and sign in
at `/login`.

## Project structure

```
app/
  login/              Staff sign-in (no sidebar chrome)
  (protected)/         Dashboard, Influencers, Codes, Redemptions — gated by middleware.ts + lib/auth.ts
  api/                 Influencer & code management, CSV export — session-gated via getAdminSession()
components/
  ui/                 Shared comic-styled primitives (buttons, badges)
  admin/               Dashboard components (sidebar, tables, forms)
lib/
  supabase/            Browser / server / middleware / service-role Supabase clients
  data/                Server-only data-fetching helpers
supabase/migrations/   Same SQL schema as the website repo
```

## Access control

Every route except `/login` is gated by `middleware.ts`, which redirects
unauthenticated requests to `/login`. That only checks for *a* Supabase
session — `(protected)/layout.tsx` then calls `getAdminSession()`, which
requires a matching row in `admin_profiles` (provisioned via
`scripts/create-admin.mjs` or a direct SQL insert). Row Level Security
enforces the same rule at the database layer, so even a bypassed UI check
can't read or write influencer/code/redemption data.

## Keeping this in sync with the website repo

`types/database.ts` and `supabase/migrations/0001_init.sql` are intentionally
duplicated between this repo and `swahili-komikcon` (no shared package — two
small, independently deployable apps instead of a monorepo). If you change
the schema, update both copies.
