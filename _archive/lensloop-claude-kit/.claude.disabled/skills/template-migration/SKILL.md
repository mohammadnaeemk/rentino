---
name: template-migration
description: Procedure to convert the foreign (LTR, English) Next.js template into the Persian RTL Lensloop app: audit, strip demo content, RTL sweep, token swap, copy translation, dead-code and dependency cleanup. Use during Phase 0 and whenever you touch leftover template code.
---

# Template migration

The project began as a foreign template (shadcn-style: Radix + Tailwind v4 + recharts + Google OAuth). Convert it in layers, cheapest and most mechanical first. One layer per commit.

## Layer order
1. **Inventory (read-only)** — run `/bootstrap` (writes `docs/REPO-MAP.md`). Use the `Explore` subagent: list routes, layouts, `components/ui`, demo/mock data, providers, assets, env usage, and Google/CDN/external URLs. Output a table: file → keep / rewrite / delete.
2. **Delete first** — demo pages, marketing sections unrelated to rental, sample charts/dashboards you will not use, unused images/fonts, unused components. Deleting is cheaper than translating. After deleting: `npm run build`.
3. **Mechanical RTL** — `npm run rtl:fix` (codemod), then `npm run rtl:scan --review`. Resolve review items by hand using the `rtl-persian-ui` skill (icons, translate-x, slide animations, popover sides, recharts).
4. **Root setup** — `lang="fa" dir="rtl"`, Vazirmatn local font, `DirectionProvider`, Toaster RTL, remove `next/font/google`.
5. **Tokens** — replace colors in `globals.css` with `docs/DESIGN-SYSTEM.md` tokens; grep for raw hex/rgb in components and replace by token classes. Keep component APIs stable.
6. **Primitives audit** — go through each `components/ui/*` used: RTL behavior, 44px targets, focus ring, states, Persian defaults (e.g. dialog close label «بستن»). Build the missing ones: Jalali date range picker, PriceBreakdown, StatusBadge, EmptyState, ErrorState, Stepper.
7. **Content and copy** — replace all English strings with Persian from the glossary; remove lorem; real Persian seed data (`lib/data/seed`).
8. **Dependencies** — remove packages with zero imports (`grep -r "from \"pkg\""`): candidates to check, not assume: `@react-oauth/google`/`jwt-decode` (kept behind a flag, D-006), `recharts` (admin only), `date-fns` (replace by `Intl` where possible; keep if the picker needs it), duplicate `radix-ui` umbrella vs `@radix-ui/*` packages (pick one style per component; do not mix in one file). Re-run `npm run build`.
9. **Routes** — reshape to `docs/UX-FLOWS.md` route map; add `proxy.ts`; add `loading/error/not-found`.
10. **Verify** — build, lint, typecheck, rtl:scan clean, screenshots of every route at 390px/1280px in both themes.

## Rules during migration
- Never translate code you intend to delete. Decide keep/delete first.
- Keep behavior while converting (RTL, tokens); change behavior in later feature tasks.
- Preserve accessibility attributes from the template; add Persian labels.
- Template licences: keep `LICENSE`/attribution files if the template requires them; ask the owner if unclear.
- If a template component fights RTL (deep absolute positioning, hard-coded physical transforms), rewrite it small instead of patching.

## Token budget tips
Run the codemod and scans (zero model tokens) before reading files. Batch similar fixes with one Grep + multi-file edits. Only open a file when scan output names it.
