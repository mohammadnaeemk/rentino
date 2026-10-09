---
name: testing-verification
description: How to prove Lensloop work is correct before saying done: Vitest for pure logic, lint/typecheck/build gates, running the app and checking UI with Playwright screenshots at mobile and desktop in both themes and RTL, accessibility checks, and honest reporting. Use before completing any task and when writing tests.
---

# Testing and verification

"Done" requires evidence. Pick the cheapest check that can fail for the thing you changed.

## Gate ladder (cheapest first)
| Check | Command | When |
|---|---|---|
| Edit hook | automatic | every edit (RTL, tokens, eslint on file) |
| Types | `npm run typecheck` | once per task |
| Lint | `npm run lint` | once per task |
| Unit | `npm test` (Vitest) | any logic, formatter, validator, schema, domain |
| RTL scan | `npm run rtl:scan` | UI work |
| Build | `npm run build` | routes, metadata, config, before finishing a feature |
| Visual | Playwright screenshots | any UI change |
| E2E | `npx playwright test` | flows (phase L5.5), run selectively |

## Unit tests (Vitest)
- Colocate `*.test.ts` beside the module. Pure functions only; no mocking of internals. Names state behavior.
- Mandatory for: `lib/format`, `lib/validators`, `lib/domain/*`, `lib/auth/otp`, zod schemas, repository conflict handling.
- Use fixed `now` inputs; never rely on the real clock. Boundary cases listed in `rental-domain`.
- Setup (done by `/bootstrap`): `npm i -D vitest`, `vitest.config.ts` with `resolve.alias` for `@`, script `"test": "vitest run"`.

## Visual verification (UI)
1. `npm run dev` in the background (`run_in_background`), wait for ready.
2. Use the Playwright MCP (configured in `.mcp.json`) to capture:
   - 390x844 and 1280x800
   - light and dark (`colorScheme` emulation or set `class="dark"`)
   - the main states you built: loading (throttle), empty, error, filled
3. **Look at the images** (Read them) and judge against `design-system` checklist: hierarchy, spacing, alignment, overflow, truncation, RTL direction, icon flips, Persian digits, contrast.
4. Interact: Tab through the page (focus visible, order right-to-left), open dialogs/sheets/menus and check side and Esc, submit forms empty and invalid.
5. Console must be clean (no hydration warnings, no 404 assets, no external requests). Check the network list for any non-local host: that is a bug (D-002).
Save screenshots under `.claude/tmp/` (gitignored), not in the repo tree.

## Accessibility quick pass
Landmarks (`header/main/nav/footer`), one `h1`, label for every control, `aria-live` for async messages, focus trap and return in overlays, color is never the only signal, `prefers-reduced-motion`. Optional automated check: `@axe-core/playwright` in the E2E setup.

## Playwright config (when added)
`projects`: mobile (iPhone 13 viewport, locale `fa-IR`, `timezoneId: "Asia/Tehran"`) and desktop; `use.locale = "fa-IR"`. Tests use role/label selectors with Persian text; avoid brittle CSS selectors.

## Reporting
Final message lists what was verified (commands passed, screens checked) and what was **not** (e.g. "no browser available: UI not visually checked"). Never claim a check you did not run. If a gate fails and you fix it, re-run that gate.

## Debug loop
Reproduce, read the exact error, form one hypothesis, change one thing, re-run the failing check. After two failed attempts, step back and re-read the relevant code instead of trying variants.
