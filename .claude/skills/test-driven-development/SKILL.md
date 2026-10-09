---
name: test-driven-development
description: Use whenever implementing new logic (functions, API route handlers, mappers, scoring/ranking code) in this repo — enforces RED-GREEN-REFACTOR instead of writing tests after the fact.
---

## Cycle
1. **RED**: write one small test for the next behavior. Run it
   (`npx vitest run <file>`) and confirm it fails with an error that matches
   what you expect (not a typo/import error).
2. **GREEN**: write the minimum code to pass that test. Run again, confirm pass.
3. **REFACTOR**: clean up duplication/naming with tests green throughout;
   re-run after each change.
4. Repeat for the next behavior.

## When to apply
- Any new function in `src/lib/**`.
- Any new Route Handler under `src/app/api/**` (e.g. the Gemini search route) — test the parsing/mapping function it calls, not the live network call.
- Any form validation schema change in `src/lib/validations.ts`.

## When NOT to over-apply
- Pure JSX layout/styling tweaks with no branching logic.
- One-off shadcn/ui wrapper with no custom behavior.

## Anti-patterns to avoid
- Writing the test after the implementation "to be safe" — defeats the
  purpose; you won't have seen it fail for the right reason.
- Asserting on implementation details (internal variable names, call counts)
  instead of observable behavior (return value, rendered output).
- One mega-test covering many behaviors — split per behavior for clear failures.
