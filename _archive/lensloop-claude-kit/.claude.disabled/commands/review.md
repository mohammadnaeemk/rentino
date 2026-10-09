---
description: Independent review of the current changes (logic/security plus UX/RTL) with fixes applied
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Agent
---

1. `git status --short` and `git diff --stat` to scope the change. If nothing changed, review the last commit.
2. In parallel: run the `code-reviewer` agent on the diff; if any `.tsx`/`.css` changed, also run `ux-rtl-auditor` on the affected routes.
3. Triage findings: fix every BLOCKER and SHOULD you agree with; for disagreement, write one line why. Do not expand scope.
4. Re-run `npm run lint`, `npm run typecheck`, `npm test`, `npm run rtl:scan`.
5. Reply in Persian, ≤6 lines: counts of findings fixed/declined, remaining items, checks run.
