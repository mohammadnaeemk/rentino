# Implementation status (verified 2026-10-09)

## Present & working
- Imported starter UI: home, gear list/detail, blog, static pages, role
  dashboards (admin/provider/customer), login/register (Google OAuth + demo).
- shadcn/ui primitives + Tailwind v4 design system (English LTR).

## Spec only / not implemented
- **AI search (Gemini)** — spec in `docs/PROJECT.md` + `gemini-ai-search` skill;
  no code in `src/`.
- **RTL / Persian localization** — app is still English LTR.
- **Backend** — external; not in repo; location TBD (see `docs/ARCHITECTURE.md`).
- **Simulated payment flow** — current types are `STRIPE | SSLCOMMERZ`.
- **OpenAPI / Swagger** — none.
- **Tests** — no runner installed (no Vitest, no `npm test`).

## Superseded
- `lensloop-claude-kit/` (now archived at `_archive/lensloop-claude-kit/`)
  described a single-operator photo-gear store. The product is a multi-vendor
  marketplace — treat that kit as reference concepts only, not the current spec.

## Recommended next steps
1. Add a test runner (Vitest) — then restore the test gate in
   `docs/CONVENTIONS.md` and re-activate `writing-vitest-tests` / `test-writer`.
2. RTL/Persian sweep: `lang="fa" dir="rtl"` in `src/app/layout.tsx`, Vazirmatn,
   logical utilities (`rtl-persian-ui` skill).
3. Implement `POST /api/ai-search` (Gemini) per `docs/PROJECT.md` +
   `gemini-ai-search` skill, with a non-AI fallback.
4. Provide/confirm the backend, then write OpenAPI from real endpoints.
