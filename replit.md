# CommercialCleaningNearMe.com

A commercial cleaning lead generation directory where facility managers find and compare cleaning companies, request free quotes, and companies pay to unlock contact details or subscribe.

## Run & Operate

- Next.js app: runs via workflow `artifacts/web-nextjs: web` (port 18831)
- API server: runs via workflow `artifacts/api-server: API Server` (port 8080)
- Required env in `artifacts/web-nextjs/.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_STARTER_PRICE_ID`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_UNLIMITED_PRICE_ID`
  - `RESEND_API_KEY` — for email sequences
  - `ADMIN_PASSWORD` — admin dashboard login
  - `NEXT_PUBLIC_SITE_URL=https://commercialcleaningnearme.com`

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS v3
- Supabase (PostgreSQL + auth), Stripe (payments), Resend (email)
- pnpm workspaces, Node.js 24

## Where things live

- Main app: `artifacts/web-nextjs/`
- App routes: `artifacts/web-nextjs/app/`
- Components: `artifacts/web-nextjs/components/`
- Lib (supabase, stripe, resend, utils): `artifacts/web-nextjs/lib/`
- DB schema: `artifacts/web-nextjs/supabase/schema.sql`
- CSV import script: `artifacts/web-nextjs/scripts/import.ts`
- Env vars: `artifacts/web-nextjs/.env.local`

## Architecture decisions

- pSEO routes use `[location]` (not separate `[state]`/`[city_state]`) to avoid Next.js dynamic slug conflicts; city vs state is detected at runtime
- `[service]` routes moved under `/service/[service]/[location]/` to avoid intercepting Next.js `_next/static` asset paths
- Supabase client uses safe fallback (no crash on missing env vars) — app renders without DB, DB calls return empty arrays
- Stripe unlock model: $35 one-time per lead OR $99/$199/$399/mo subscription tiers
- Admin dashboard at `/admin` protected by `ADMIN_PASSWORD` env var cookie

## Product

- **Facility managers**: search directory, select up to 3 companies, submit free quote request
- **Cleaning companies**: claim free listing, pay $35/lead to unlock contact info, or subscribe monthly
- **pSEO**: thousands of city/state/service landing pages for organic SEO traffic
- **Admin**: company management, lead tracking, revenue analytics, email intelligence

## Gotchas

- After any route structure change, delete `artifacts/web-nextjs/.next/` and restart workflow
- `[service]` dynamic root routes intercept `_next/static` paths — keep service routes under `/service/` prefix
- Supabase `createClient` throws on invalid URL at import time — use the safe wrapper in `lib/supabase.ts`
- CSS served via Next.js internal handler in dev mode (no static file at `_next/static/css/app/layout.css`)

## Pointers

- Supabase schema: `artifacts/web-nextjs/supabase/schema.sql`
- See `pnpm-workspace` skill for monorepo structure
