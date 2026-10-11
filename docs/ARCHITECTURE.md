# Architecture (verified 2026-10-09)

## Frontend
- Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4 +
  shadcn/ui (`new-york`) + Radix UI.
- Route groups: `(auth)`; role dashboards at
  `src/app/dashboard/{admin,provider,customer}` (each with its own `layout.tsx`).
- Auth: Google OAuth (`@react-oauth/google`) + demo login + JWT, via
  `src/lib/auth-context.tsx`.
- Data client: `src/lib/api.ts` — single typed `fetch` wrapper with
  JWT-refresh-on-401.

## Backend — EXTERNAL, not in this repo
- No backend directory, no database, no OpenAPI file in this repo.
- Base URL: `NEXT_PUBLIC_API_URL` (fallback `http://localhost:8000/api`).
- The imported `README.md` references a separate "gearup-backend"
  (Express + Prisma + PostgreSQL + Stripe). Its actual location is **unknown /
  TBD** — provide it or confirm "not built yet".
- `src/app/page.tsx` also reads a legacy `NEXT_PUBLIC_BACKEND_API_URL` (to normalize).

## Current state vs. target
- `src/app/layout.tsx` is now **Persian RTL**: `lang="fa" dir="rtl"`, self-hosted
  Vazirmatn via `next/font/local`, `Toaster dir="rtl" position="bottom-center"`.
  Google OAuth remains.
- `src/middleware.ts.desabled` is a disabled role-guard (renamed to break Next.js
  wiring). No `proxy.ts`.
- Payment types are `STRIPE | SSLCOMMERZ` (imported); the target is a **simulated**
  payment flow (no real gateway).
- AI search (Gemini) is **spec only** — no `src/app/api/`, no Gemini code in `src/`.
- No test runner installed (no Vitest, no `npm test`).

## RTL / localization
Applied: `dir="rtl" lang="fa"`, self-hosted Vazirmatn, logical Tailwind
utilities (enforced by `.claude/hooks/check-edit.mjs`). Jalali dates and Persian
digits flow through the `rtl-persian-ui` skill's `lib/format.ts` templates.
Remaining: 17 advisory `rtl-scan --review` items. See `docs/STATUS.md`.
