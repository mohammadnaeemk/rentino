---
description: One-time setup — map the repo, add scripts and vitest, confirm product assumptions, prepare RTL and tokens baseline
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Agent, AskUserQuestion
---

Run once at the start (and again after large template changes). Keep output compact.

1. **Map the repo.** Use the `Explore` subagent ("medium") to inventory: `app/` routes and layouts, `components/` (ui vs others), `lib/`, providers, data/mocks, assets, env usage, external URLs (fonts, CDNs, analytics), Google login usage, config files (`next.config`, `tsconfig`, `eslint`, `postcss`, `globals.css`). Write `docs/REPO-MAP.md` (≤120 lines): tree to depth 3, route table, component inventory, template leftovers (keep/rewrite/delete), risks.
2. **Scripts.** Edit `package.json` scripts, preserving existing ones:
   `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"rtl:scan": "node .claude/scripts/rtl-scan.mjs"`, `"rtl:fix": "node .claude/scripts/rtl-codemod.mjs --write"`.
   Install dev tools only if missing: `npm i -D vitest`. Create `vitest.config.ts` (alias `@` → project root or `src`, environment `node`). Do not add other dependencies.
3. **Gitignore.** Ensure `.claude/tmp/`, `.data/`, `.env*` (except `.env.example`) are ignored.
4. **Baseline checks.** Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run rtl:scan`. Record counts (not full output) at the end of `docs/REPO-MAP.md`.
5. **Confirm assumptions.** With one `AskUserQuestion` call (max 4 questions) ask the owner the highest-impact items from `docs/PRD.md` §8 that are still `[ASSUMED]`: single operator vs marketplace, deposit handling, auth method, brand name/colors (or "decide for me"). Apply answers: update `docs/PRD.md` and mark matching `DECISIONS.md` entries `accepted`. If the owner is unavailable, keep defaults and say so.
6. **Fonts.** Check `public/fonts/` for Vazirmatn; if absent, tell the owner exactly which file to place (Vazirmatn variable woff2) because downloading from external hosts may be blocked.
7. Tick `F0.1` in `docs/ROADMAP.md`. Reply in Persian, ≤6 lines: what exists, baseline numbers, what needs the owner.
