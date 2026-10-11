@AGENTS.md

# LensLoop (rentino/) — Persian RTL rental marketplace

Persian (Farsi, RTL) multi-vendor rental marketplace: cars, consoles, bikes,
cameras, and other rentable goods. Providers list gear; customers search, check
availability, and book. Product goals: `docs/PROJECT.md`.

## Verified stack
Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 ·
shadcn/ui (`new-york`) · Radix · react-hook-form + zod · Sonner. Backend is an
external API (`NEXT_PUBLIC_API_URL`); there is no backend in this repo.

## Source of truth (read in this order)
- `docs/CONVENTIONS.md` — stack, directory map, coding rules
- `docs/PROJECT.md` — product goals & AI-search spec
- `docs/DOMAIN.md` — data model (Gear, RentalOrder, Payment, roles)
- `docs/ARCHITECTURE.md` — verified architecture & known gaps
- `docs/STATUS.md` — what exists vs. what's planned

## Hard constraints
- Persian RTL is the shipped UI: `src/app/layout.tsx` has `lang="fa" dir="rtl"`
  with self-hosted Vazirmatn. Keep it that way — logical Tailwind utilities only
  (`ms/me/ps/pe/start/end/text-start`), enforced by the edit hook.
- Never expose `GEMINI_API_KEY` or backend secrets to the client (server-only).
- Category-specific behavior stays data-driven (`Category` + `specifications`).

## Tooling
On-demand skills in `.claude/skills/`, agents in `.claude/agents/`, project
invariants in `.claude/rules/`. Invoke only when relevant.
- `.claude/settings.json` wires two hooks: `SessionStart` (prints status) and
  `PostToolUse` on every edit (`check-edit.mjs` — blocks RTL/token/ESLint
  violations, advises on directional icons).
- Deterministic scripts in `.claude/scripts/`: `rtl-scan.mjs` (audit),
  `rtl-codemod.mjs --write` (auto-fix), `rtl-rules.mjs` (shared rules).
- Verify UI in a real browser with the `web-testing` skill before claiming a
  page works. Beginner overview: `docs/claude-guide.html`.
