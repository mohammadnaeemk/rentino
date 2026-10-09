---
name: verification-before-completion
description: Use right before declaring any task/feature/bugfix "done" in this repo — a final checklist to run so claims are backed by actual command output, not assumption.
---

Run, in order, and only report success if the command actually exited 0:
1. `npm run lint` — zero errors in touched files.
2. `npx tsc --noEmit` (or rely on `next build` which type-checks) — zero type errors.
3. `npx vitest run` — all tests pass, including any new ones you just wrote.
4. `npm run build` — required for any routing/data-fetching/config change.

If any step fails, go to `systematic-debugging` skill, fix, and re-run the
full checklist from step 1 (a fix can introduce a new lint/type issue).

Never tell the user "this works" / "tests pass" without having just run the
command in this session and seen the output. Paste the relevant output lines
as evidence in your final summary.
