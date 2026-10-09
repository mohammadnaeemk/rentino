---
description: Take the next unchecked roadmap item and complete it end to end with the feature loop
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Agent, Skill
---

1. Read `docs/ROADMAP.md`. Pick the first unchecked item (skip items blocked by an unticked dependency in an earlier phase; say why). If `docs/REPO-MAP.md` is missing, run `/bootstrap` first.
2. State the goal and acceptance criteria in 2-4 lines.
3. Load the `feature-loop` skill and follow it fully, loading only the other skills the item needs (UI → `design-system` + `rtl-persian-ui`; flows → `ux-flows`; booking/pricing → `rental-domain`; auth/payment → `iran-integrations`; routes/data → `nextjs-conventions`; template cleanup → `template-migration`).
4. Verify per `testing-verification`. Run `ux-rtl-auditor` for UI items and `code-reviewer` for logic/security items; fix findings.
5. Tick the item, record decisions, update `docs/REPO-MAP.md`, commit.
6. Reply in Persian, ≤5 lines: what is done, how it was verified, what is next. Then stop (one task per run).
