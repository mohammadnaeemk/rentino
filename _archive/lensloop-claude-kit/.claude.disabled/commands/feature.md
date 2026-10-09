---
description: Build a feature from a short description using the full loop (explore, plan, build, verify, review, commit)
argument-hint: <feature description in any language>
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Agent, Skill
---

Feature request: $ARGUMENTS

Load the `feature-loop` skill and execute it. Specifically:
- Frame goal and acceptance criteria; default product questions from the docs and record them.
- If it spans more than 3 files, call the `feature-planner` agent first and follow its plan.
- Build vertical slices; write tests for logic first; cover loading/empty/error/success; Persian copy; RTL.
- Verify with `testing-verification`, then run `ux-rtl-auditor` (UI) and/or `code-reviewer` (logic, security) and fix findings.
- Add the feature to `docs/ROADMAP.md` if it was not there, tick it, record decisions, commit.
Reply in Persian, ≤5 lines.
