# Decision log

Format: `D-NNN · status · decision · why`. Status: `proposed` (default until the owner confirms in `/bootstrap`), `accepted`, `superseded by D-NNN`. Append new decisions at the bottom. Keep each to a few lines.

- **D-001 · proposed · Persian only, no i18n library.** UI strings inline in Persian; shared strings in `lib/copy.ts`. Why: single market; an i18n layer adds cost with no benefit. Revisit only if a second language is requested.
- **D-002 · proposed · Self-host everything (fonts, scripts, images).** Vazirmatn via `next/font/local`. Why: Google Fonts and many CDNs are unreliable or blocked in Iran, and builds must work offline from Iran.
- **D-003 · proposed · Money is integer Rial in code and storage; UI shows Toman.** Branded type `Rial`, helper `formatToman`. Why: gateways and banks use Rial; avoids float errors and ×10 confusion.
- **D-004 · proposed · Repository layer with typed mock data first.** `lib/data/*` interfaces, mock implementation, real DB later. Why: lets UI and flows ship without a backend decision; swap is local.
- **D-005 · proposed · Rental days are inclusive calendar days.** `days = end - start + 1`, Asia/Tehran. Why: matches how renters talk ("from Saturday to Monday = 3 days").
- **D-006 · proposed · Phone OTP is the primary login; Google login is optional and off by default.** Template already ships `@react-oauth/google` and `jwt-decode`; keep them behind a feature flag. Why: Google endpoints are often unreachable and Iranian users expect SMS login.
- **D-007 · proposed · Store ISO Gregorian, display Jalali via `Intl` (`fa-IR-u-ca-persian`).** Picker via `react-day-picker/persian`. Why: zero extra dependency, correct calendars, simple storage.
- **D-008 · proposed · Tests: Vitest for pure logic, Playwright for flows.** Why: domain logic (pricing, availability, validators) is where bugs cost money; flows need real-browser checks in RTL.
- **D-009 · proposed · RTL enforced by tooling.** Edit hook + `rtl:scan` + `rtl:fix` codemod; logical Tailwind utilities only. Why: prevents regressions from template code and from model habits.
- **D-010 · proposed · Deposit is paid online and refunded after inspection.** Why: Iranian gateways do not offer card holds; confirm with owner (A-2).
- **D-011 · proposed · Product slugs are Latin kebab-case (`sony-a7-iv`).** Persian name stays in content. Why: clean sharing links, no percent-encoding noise.
- **D-012 · proposed · Next 16 conventions.** `proxy.ts` instead of middleware, async request APIs, Server Components by default, server actions with zod. Why: current framework behavior.
