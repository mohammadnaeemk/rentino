---
name: feature-loop
description: The mandatory loop for building or changing any Lensloop feature, page or component: explore, plan, build in small steps, verify with evidence, review, commit. Use at the start of every feature, page or bug-fix task.
---

# Feature loop

Anthropic's agent pattern: gather context, act, verify, repeat. Cheap steps first, expensive steps only when needed.

## 0. Frame (1 minute)
State the goal and acceptance criteria in 2-4 lines (from `docs/ROADMAP.md` item or the user's request). If a product decision is missing, pick the default from `docs/PRD.md`/`DECISIONS.md` and note it. Ask the user only if the answer changes what you build and cannot be defaulted.

## 1. Explore (read little, read the right things)
- `docs/REPO-MAP.md` first (what exists, where). Then Grep for the symbol or route; Read only the needed line ranges.
- Load only the skills the task needs: UI work → `design-system`, `rtl-persian-ui`; flows → `ux-flows`; pricing/booking → `rental-domain`; auth/payment/SMS → `iran-integrations`; routing/data/actions → `nextjs-conventions`.
- Wide questions ("where is X used", "how does Y work across files") go to the `Explore` subagent; take only the conclusion.
- Library API unsure: context7 MCP, not memory and not `node_modules`.

## 2. Plan (only if it touches more than 3 files or adds a new pattern)
Write a short plan in the reply: files to create/change, data shape, states, edge cases, tests. For big or risky work use the `feature-planner` agent. Reuse existing components and tokens before creating new ones. Prefer deleting template code over wrapping it.

## 3. Build in small vertical steps
Order: types and zod schema → pure logic (+ unit test) → data/repository or server action → UI (Server Component first) → states (loading, empty, error, success) → copy in Persian → a11y.
- One concern per edit. Batch edits per file.
- The edit hook reports RTL, token and lint problems immediately; fix them before moving on.
- No speculative abstractions: write the second use before extracting.

## 4. Verify (evidence required)
1. `npm run lint && npm run typecheck` (once, after the batch).
2. `npm test` if logic changed. Write tests first for money, dates, availability, validators.
3. UI: follow `testing-verification` (run app, screenshot at 390px and 1280px, light and dark, check RTL). If you cannot run a browser, say exactly what was not verified.
4. `npm run rtl:scan` for the touched area.
Fix the cause, not the symptom. If the same fix fails twice, stop, re-read the error, and change approach.

## 5. Review
- Self-review the diff against `CLAUDE.md` hard rules and the checklist in `design-system`.
- For UI changes of any size, run the `ux-rtl-auditor` agent on the touched routes. For logic or security-sensitive changes, run `code-reviewer`. Act on every finding or record why not.

## 6. Close
- Tick the roadmap item, append decisions to `docs/DECISIONS.md`, update `docs/REPO-MAP.md` if routes or modules were added.
- Commit with a conventional message (`feat(booking): ...`). One logical change per commit.
- Final reply to the user in Persian, 3-5 lines: what works now, what was verified, what is left or needs their decision.

## Stop conditions
Stop and ask when: a destructive or irreversible action is needed; a real credential/key is required; the request contradicts `docs/PRD.md`; or two sensible product interpretations lead to very different UX.
