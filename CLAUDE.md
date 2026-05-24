# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

NIGHTOS is a Next.js 14 (App Router) workspace MVP for night-entertainment venues
(キャバクラ / ラウンジ / クラブ). Data flows: **store inputs → mama/oneesan coaches →
cast uses it**. The README is the authoritative product/deploy doc (in Japanese);
this file is the architecture map for code changes.

## Commands

```bash
npm run dev          # next dev — local app at http://localhost:3000
npm run build        # next build (production)
npm run lint         # next lint (ESLint)
npm test             # vitest run — unit tests in tests/
npm run test:watch   # vitest watch mode

# Run a single unit test
npx vitest run tests/validation.test.ts
npx vitest run -t "name of test"   # filter by test name

# E2E (Playwright is NOT in package.json — install on demand)
npm install -D @playwright/test && npx playwright install chromium
npx playwright test                # needs `npm run dev` up, or it starts one
PLAYWRIGHT_BASE_URL=<url> npx playwright test   # target a preview/staging URL
```

There is no typecheck script; `npm run build` is the TypeScript gate (strict mode).
`@/*` resolves to the repo root (see `tsconfig.json`). Note `tsconfig.json` and
`vitest.config.ts` **exclude** `_archive/`, `demo/`, and `e2e/` — `_archive/` is
dead code kept for reference; don't edit it expecting it to ship.

## The central architecture: 3 modes, 3-layer fallback

The single most important concept. The app runs in three modes selected purely by
environment variables, and **the UI is identical in all three** — the mode is decided
at the data-access boundary, not in components:

| Mode | Trigger | Behavior |
|------|---------|----------|
| Mock | no env vars | in-memory seed data (`lib/nightos/mock-data.ts`) |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | real Postgres |
| AI | `ANTHROPIC_API_KEY` (combinable with above) | real Claude responses |

Every fallback degrades instead of crashing: no env → mock; Supabase throws → mock;
Claude throws/missing key → canned stub response.

**`lib/nightos/supabase-queries.ts` is the mode boundary.** Every public query goes
through `withFallback(name, realFn, mockFn)`, which:
1. returns the mock immediately if Supabase is not configured, then
2. tries the real impl (`lib/nightos/supabase-real.ts`), falling back to mock on any throw.

CRITICAL: always check env vars **before** constructing a Supabase client —
`createServerSupabaseClient()` (`lib/supabase/server.ts`) uses non-null assertions on
the URL/key and throws at runtime if they're undefined. `withFallback` already guards
this; preserve that ordering in new code. When adding a query, add it to BOTH
`supabase-queries.ts` (the wrapper + mock) and `supabase-real.ts` (the real impl).

## Auth: dual system (mock cookie + Supabase)

`lib/nightos/auth.ts` is the only place that resolves "who is logged in." Two schemes
coexist:

- **Mock auth (dev/demo):** the role selector sets an httpOnly cookie
  `nightos.mock-cast-id`; `getMockCast()` looks the persona up in `mockCasts`.
- **Real auth:** Supabase email/password; `getCastByAuthUserId()` maps the auth user
  to a `nightos_casts` row.

`getCurrentCast()` prefers a real Supabase session and falls back to the mock cookie.
`getCurrentCastId()` / `getCurrentManagerId()` add hardcoded fallback IDs from
`constants.ts` (`CURRENT_CAST_ID = "cast1"`, etc.) so server components always have an ID.

**Production safety flag:** `NIGHTOS_DISABLE_MOCK_AUTH=true` must be set in prod — it
hides the demo login UI, makes `mockLogin` throw, and stops both `middleware.ts` and
`auth.ts` from honoring the mock cookie. Helper: `isMockAuthDisabled()` in `env.ts`.
`middleware.ts` redirects unauthenticated users to the role-appropriate login and
refreshes the Supabase session cookie on every request.

**Account-bound role enforcement (migration 008):** route-group layouts under
`app/<role>/(app)/layout.tsx` re-check `getCurrentRole()` server-side and `redirect()`
wrong roles to their own home — you can't URL-poke into another role's area. When adding
a role-scoped route, place it inside that role's `(app)` group so it inherits the guard.

## CastProvider: server resolves identity, client consumes it

No prop-drilling of the current cast. The `(app)` layout resolves the cast/manager IDs
server-side, then wraps children in `<CastProvider>` (`lib/nightos/cast-context.tsx`).
Client components read it via `useCastId()` / `useCast()` / `useManagerId()`. Server
components call the `auth.ts` helpers directly. Prefer Server Components; mark only
interactive leaves `"use client"`. Form mutations are Server Actions (`actions.ts`
files, `"use server"`) that call queries and `revalidatePath`.

## Feature module layout

UI is organized by feature in `features/<feature>/`, not by file type. A typical
feature has `components/`, `data/` (selectors, static content), `lib/` (client-side
stores), and `actions.ts` (Server Actions). `app/` holds thin route files that compose
features. Shared UI primitives: `components/nightos/` (app-specific kit) and
`components/ui/` (generic). The AI assistant feature lives in `features/ruri-mama/`
(legacy dir name) but is displayed to users as **さくらママ** — see
`SAKURA_MAMA_DISPLAY_NAME` in `constants.ts`; don't rename user-facing strings to "ruri".

## API routes (`app/api/*/route.ts`)

All Claude-backed endpoints follow the same shape (see `api/ruri-mama/route.ts`):
validate input with a shared Zod schema via `parseBody(req, schema)` from
`lib/nightos/validation.ts` (returns a `NextResponse` on failure — early-return it),
then branch: no `ANTHROPIC_API_KEY` → return a stub; live call wrapped in try/catch →
stub on any failure. Add new request schemas to `validation.ts` to keep limits/patterns
centralized. Claude model is pinned in `constants.ts` (`SAKURA_MAMA_MODEL`,
currently `claude-haiku-4-5-20251001`).

**Gated setup endpoints:** `/setup`, `/api/setup`, `/api/setup-auth` are guarded by
`lib/nightos/admin-gate.ts`. They 404 unless `NIGHTOS_SETUP_SECRET` (≥16 chars) is set
**and** the request's `?secret=` matches (constant-time compare). Correct production
state is to leave `NIGHTOS_SETUP_SECRET` **unset** so these endpoints vanish.

## Database / migrations

`supabase/migrations/` run in numeric order (see `supabase/MIGRATE.md`). All are
idempotent (`if [not] exists`). Key evolution to be aware of: migrations **006/007
disabled RLS** for MVP speed, and **010 re-enables RLS** with `auth.uid()`-scoped
policies and revokes anon writes. So the README's "RLS off" instructions reflect an
earlier state — for a secure deployment, 010 is the current intent. If a Supabase-mode
feature suddenly returns empty rows or 401s, suspect RLS policy scope.

Convention: **all table primary keys are TEXT**, so a mock ID and its DB row share the
same value — this is what lets the same code path work across mock and Supabase modes.

## Conventions & gotchas

- Error logging goes through `reportError` / `reportWarning` (`lib/nightos/error-reporter.ts`),
  which emit structured `[nightos:error]` / `[nightos:warn]` JSON lines that Vercel scrapes.
  Grep those tags when debugging prod. The shim is vendor-agnostic by design.
- `MOCK_TODAY` (`mock-data.ts`) is the fixed "today" for the demo so seeded dates and
  stats stay consistent; code uses real `new Date()` only in Supabase mode.
- Two role/venue axes exist: **venue type** (`club` | `cabaret`) and **club role**
  (`mama` | `oneesan` | `help`) plus account `user_role` (`cast` | `store_*` | `customer`).
  `cast-home`, for example, has separate `-club` / `-cabaret` variants.
- Tailwind uses a custom palette (pearl / champagne / rose-gold / amethyst / blush) in
  `tailwind.config.ts`; mobile-first, layouts cap width ~520px.
- Unit tests cover pure logic only (CSV, validation, follow-selector, demo-data
  integrity). Anything browser/route-level belongs in Playwright `e2e/` (includes a
  security suite: route protection, IDOR, RLS bypass, XSS/CSRF).
