# Project: Persian Rental Marketplace (codename: LensLoop)

Rebrand of an imported "outdoor gear rental" starter into a general-purpose
Persian (Farsi, RTL) rental marketplace: cars, houses/apartments (short-term),
bikes, cameras, and other equipment — all under one extensible "listing"
(`Gear`) model.

## Product goals
- Browse/search listings across categories via filters AND free-text AI search.
- AI search: user types a natural-language query in Farsi or English
  (e.g. "یک دوربین ارزون برای عکاسی عروسی آخر هفته") → call Google Gemini
  free-tier API → get back structured intent (category, price range,
  keywords, dates) → use it to filter/rank existing listings → show results.
- Booking flow, payments, reviews, provider/admin dashboards: keep existing
  patterns from the imported codebase (see docs/CONVENTIONS.md).
- UI must support RTL (`dir="rtl"`) and Persian typography; keep existing
  design system (Tailwind v4 + shadcn/ui + Radix) rather than inventing a new one.

## AI search architecture (high level)
1. Client sends raw query text to `POST /api/ai-search` (Next.js Route Handler).
2. Route handler calls Gemini (`gemini-2.0-flash` or newer free-tier model)
   with a strict JSON-schema prompt → structured `{ category, keywords[],
   minPrice?, maxPrice?, location? }`.
3. Server merges structured intent with the existing `/gear` backend query
   params (see `src/lib/api.ts`, `src/lib/gear.ts`) and returns ranked `GearItem[]`.
4. Never expose the Gemini API key to the client — call only from server
   (Route Handler / Server Action), read key from `process.env.GEMINI_API_KEY`.
5. Always have a non-AI fallback: if Gemini call fails or is rate-limited,
   fall back to plain keyword search against existing listings so the search
   bar never breaks.

## Source of truth
- This file + `docs/CONVENTIONS.md` are the persistent project memory.
- Category-specific logic (car vs. house vs. bike vs. camera) should stay
  data-driven (`Category` + `specifications` JSON on `Gear`) rather than
  hardcoded per-category branching, so new categories don't need code changes.
