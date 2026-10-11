# Implementation status (verified 2026-10-09)

## Present & working
- Imported starter UI: home, gear list/detail, blog, static pages, role
  dashboards (admin/provider/customer), login/register (Google OAuth + demo).
- shadcn/ui primitives + Tailwind v4 design system.
- **Persian RTL** — `src/app/layout.tsx` is `lang="fa" dir="rtl"` with
  self-hosted Vazirmatn; `rtl-scan` reports 0 hard violations project-wide
  (17 advisory review items remain, mostly directional icons/translate-x).

## Spec only / not implemented
- **AI search (Gemini)** — spec in `docs/PROJECT.md` + `gemini-ai-search` skill;
  no code in `src/`.
- **RTL / Persian localization** — done for the shell (see above); the 17
  advisory items from `node .claude/scripts/rtl-scan.mjs --review` are unverified.
- **Backend** — external; not in repo; location TBD (see `docs/ARCHITECTURE.md`).
- **Simulated payment flow** — current types are `STRIPE | SSLCOMMERZ`.
- **OpenAPI / Swagger** — none.
- **Tests** — no runner installed (no Vitest, no `npm test`).

## Verified gaps (found by browser testing 2026-10-11)
- **Category deep-links do nothing.** The home page's category tiles link to
  `/gear?category=<slug>` (`src/app/page.tsx`), but `src/app/gear/page.tsx` has
  no `useSearchParams` — every tile lands on the unfiltered list. Confirmed by
  loading `/gear?category=cameras` and getting all 13 items.

## Superseded
- `lensloop-claude-kit/` (now archived at `_archive/lensloop-claude-kit/`)
  described a single-operator photo-gear store. The product is a multi-vendor
  marketplace — treat that kit as reference concepts only, not the current spec.

## Recommended next steps
1. Add a test runner (Vitest) — then restore the test gate in
   `docs/CONVENTIONS.md` and re-activate the archived TDD kit
   (`_archive/skills/writing-vitest-tests/`, `_archive/agents/test-writer.md`).
2. Resolve the 17 advisory RTL items:
   `node .claude/scripts/rtl-scan.mjs --review`.
3. Implement `POST /api/ai-search` (Gemini) per `docs/PROJECT.md` +
   `gemini-ai-search` skill, with a non-AI fallback.
4. Provide/confirm the backend, then write OpenAPI from real endpoints.
