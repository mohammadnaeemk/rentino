# Lensloop — Persian (RTL) equipment-rental storefront

Iranian marketplace for renting cameras, lenses and gear. Started from a foreign Next.js template that we are localizing and rebuilding. UI: Persian (fa-IR), RTL, Jalali calendar, Toman. Product intent lives in `docs/PRD.md`; read it before product decisions, not before every task.

## Stack (from package.json — do not re-verify)
Next 16 (App Router, Turbopack) · React 19.2 · TypeScript · Tailwind v4 (CSS-first `@theme` in `globals.css`, no tailwind.config) · Radix UI via shadcn-style components in `components/ui` · cva + clsx + tailwind-merge (`cn`) · react-hook-form + zod · sonner · next-themes · recharts · lucide-react · date-fns.
No database, ORM or test runner yet. Data goes through repository modules in `lib/data/` (mock first, real backend later). See `docs/DECISIONS.md`.

## Commands
`npm run dev | build | lint | typecheck | test | rtl:scan | rtl:fix` (`typecheck`, `test`, `rtl:*` are added by `/bootstrap`).

## Hard rules
1. RTL: `<html lang="fa" dir="rtl">`. Tailwind logical utilities only: `ms/me/ps/pe/start/end/text-start/text-end/border-s/border-e/rounded-s/rounded-e`. Never `ml/mr/pl/pr/left/right/text-left/text-right`. A hook blocks violations; fix with `npm run rtl:fix -- <file>`.
2. Language: UI text in Persian. Code, identifiers, comments and commit messages in English. Replies to the user in Persian, short.
3. Numbers and dates: always through `lib/format.ts` (fa-IR digits, Jalali via Intl). Store dates as UTC ISO strings.
4. Money: integer Rial in code and storage (`type Rial`). Display Toman with `formatToman()`.
5. Design tokens only. No hex/rgb colors or arbitrary pixel values in components. Tokens: `app/globals.css`. Spec: `docs/DESIGN-SYSTEM.md`.
6. Server Components by default. `"use client"` only for state, effects or browser APIs, as deep in the tree as possible. Next 16: `params`, `searchParams`, `cookies()`, `headers()` are async; `proxy.ts` replaces `middleware.ts`.
7. Validate every input with a zod schema in `lib/schemas/`, shared by the form and the server action.
8. Every data view has loading, empty and error states. Every form has validation, pending, success and failure states.
9. Accessibility: semantic HTML, labelled inputs, visible focus, 44px touch targets, AA contrast, keyboard reachable.
10. No new dependency unless an existing one cannot do the job. Delete unused template code in any area you touch.

## Workflow
- Start with `/next-task` (next unchecked item in `docs/ROADMAP.md`) or `/feature <description>`. Follow the `feature-loop` skill: explore, plan (if more than 3 files), build, verify, review, commit.
- Verify by running things. Lint and typecheck always. For UI, also look at it at 390px and 1280px in light and dark (`testing-verification` skill). Do not say "done" without evidence.
- When you make a lasting choice, append it to `docs/DECISIONS.md`. When a task is finished, tick it in `docs/ROADMAP.md`.
- Ask the user only when blocked on a product decision you cannot reasonably default. Otherwise decide, record it, and say so in one line.

## Token economy
- Grep first, then Read with `offset`/`limit`. Never read a whole file you only need part of. Never re-read a file after editing it.
- Never open `node_modules`, `.next`, lockfiles or generated files. For library API doubts use the context7 MCP.
- Delegate wide searches and reviews to subagents (`Explore`, `code-reviewer`, `ux-rtl-auditor`) so only conclusions return.
- Work in one route or feature per session. `/clear` between unrelated tasks. Keep `/compact` hints short.
- Prefer one batched edit per file over many small edits. Run lint and typecheck once per task, not after every edit (the edit hook already catches RTL and lint errors on the file).

## Where things are
Skills: `.claude/skills/` (load on demand). Agents: `.claude/agents/`. Commands: `.claude/commands/`. Docs: `docs/`. Repo map (generated once by `/bootstrap`): `docs/REPO-MAP.md`.
