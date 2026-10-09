---
name: systematic-debugging
description: Use when a build, lint, test, or runtime error in this Next.js project isn't immediately obvious — a repeatable 4-phase root-cause process instead of guessing fixes.
---

## Phase 1 — Reproduce
Run the exact failing command and capture full output:
`npm run lint`, `npm run build`, `npx vitest run`, or the dev server log.
Never fix based on a partial/paraphrased error message.

## Phase 2 — Localize
Read the stack trace top to bottom; find the first frame inside `src/`
(not `node_modules` or `.next`). Open that file at the exact line.

## Phase 3 — Root cause
Trace backwards: what data/props/env var produced the bad state?
Common root causes in this codebase:
- Missing/renamed env var (`NEXT_PUBLIC_API_URL` vs a typo) — check `.env*`.
- Type mismatch between backend `ApiGear` shape and `GearItem` (see `src/lib/gear.ts`).
- Server Component using `src/lib/api.ts` (client-only credentials flow) instead of plain `fetch`.
- Route Handler accidentally reading a `NEXT_PUBLIC_*` secret, or a server-only secret leaking into client code.

## Phase 4 — Fix and verify
Apply the smallest fix that addresses the root cause (not a symptom-level
try/catch). Re-run the exact same command from Phase 1 and paste the new
output as evidence before declaring it fixed.

## Never
- Declare "fixed" without re-running the reproduction command.
- Add a broad `// @ts-ignore` or `any` to silence an error instead of fixing types.
