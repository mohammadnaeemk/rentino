# Roadmap

How to use: `/next-task` takes the first unchecked item. Each item is sized for one focused session (one route or one feature). Tick it only when the Definition of Done holds.

## Definition of Done (every task)
- Works at 390px and 1280px, light and dark, RTL, with Persian digits and Jalali dates where relevant.
- Loading, empty and error states exist. Forms have validation, pending, success, failure.
- `npm run lint`, `npm run typecheck` pass. `npm run rtl:scan` has no hard violations. New logic has unit tests.
- Keyboard and screen-reader basics hold (labels, focus order, focus ring).
- Template leftovers in the touched area are removed. Decisions recorded in `docs/DECISIONS.md`.

## Phase 0 — Foundation
- [ ] **F0.1 Bootstrap.** Run `/bootstrap`: repo map, package scripts (typecheck, test, rtl:scan, rtl:fix), vitest installed, assumptions confirmed. AC: `docs/REPO-MAP.md` exists; scripts run.
- [ ] **F0.2 Root layout.** `<html lang="fa" dir="rtl">`, self-hosted Vazirmatn via `next/font/local`, fa metadata, ThemeProvider, Radix `DirectionProvider`, Sonner Toaster for RTL. AC: `rtl:scan` passes on layout; no network font requests.
- [ ] **F0.3 RTL sweep.** `npm run rtl:fix`, then resolve review items in `components/ui` (icons, translate-x, slide animations, popover sides). AC: `rtl:scan --review` shows 0 unresolved.
- [ ] **F0.4 Tokens.** Implement tokens from `docs/DESIGN-SYSTEM.md` in `globals.css` (light and dark, radius, shadows, type scale, motion). Use `/brand` if the owner supplied brand colors. AC: no raw colors left in components.
- [ ] **F0.5 Formatters and utils.** `lib/format.ts` (digits, Toman, Jalali date and range, relative time), `lib/schemas/common.ts` (phone, national code). Unit tests. AC: tests cover edge cases in `rental-domain` and `iran-integrations` skills.
- [ ] **F0.6 Template strip.** Remove demo pages, English copy, lorem, unused assets and dependencies. Leave the route skeleton from `docs/UX-FLOWS.md`. AC: build passes; no English UI strings.
- [ ] **F0.7 UI kit audit.** Verify Button, Input, Textarea, Select, Checkbox, Radio, Switch, Dialog, Sheet, Tabs, Accordion, Popover, Tooltip, Toast, Skeleton in RTL. Build a Jalali single-date and range picker. Add dev-only `/dev/ui` gallery. AC: gallery screenshots checked in both themes.

## Phase 1 — Public storefront
- [ ] **S1.1 Shell.** Header (logo, search, categories, booking cart, account), mobile nav sheet, footer with trust block and contact. AC: usable at 390px with one hand.
- [ ] **S1.2 Data layer.** Types and mock repositories for categories, brands, products, units, availability (`lib/data/*`), seed data in Persian (24+ realistic products). AC: repository interface documented in the skill; swapping implementation needs no UI change.
- [ ] **S1.3 Home.** Hero with date-and-category quick search, featured categories, popular gear, how it works (3 steps), trust and policy highlights, FAQ teaser.
- [ ] **S1.4 Catalog.** `/gear` list with URL-synced filters and sort, availability filter by dates, pagination, skeletons, empty state, mobile filter sheet.
- [ ] **S1.5 Product page.** Gallery, price tiers, deposit info, Jalali range picker with live availability and price breakdown, sticky mobile booking bar, specs tabs, related, reviews list. AC: price math matches `rental-domain` tests.
- [ ] **S1.6 Search.** Command-style search with Persian normalization (ي/ی, ك/ک, digits). AC: typing Arabic or Persian variants finds the same product.
- [ ] **S1.7 Static pages.** FAQ, rental rules, about, contact, privacy. Content from `persian-copywriter` agent, reviewed by owner.

## Phase 2 — Booking and checkout
- [ ] **B2.1 Booking cart.** Persisted cart (cookie or server), one range per booking, conflict handling when availability changes.
- [ ] **B2.2 OTP auth.** Phone entry, 6-digit code, resend timer, rate limit, session cookie, `proxy.ts` protection for `/account` and `/checkout`. SMS provider behind an interface; dev mode logs the code.
- [ ] **B2.3 Checkout stepper.** Info, identity, delivery, review and pay. Each step validated by zod, resumable.
- [ ] **B2.4 Payment.** Zarinpal sandbox: request, redirect, callback verify, idempotent confirmation, failure and cancel paths, payment timeout releases the hold.
- [ ] **B2.5 Confirmation.** Booking code, status, invoice (printable page), next steps (pickup address, time, what to bring).

## Phase 3 — Customer account
- [ ] **C3.1 Bookings.** List with status filters, detail with timeline, cancel (policy-aware refund preview), extend request.
- [ ] **C3.2 Profile and KYC.** Edit info, ID upload, verification status.
- [ ] **C3.3 Favorites and reviews.** Save gear, review after completed booking.

## Phase 4 — Admin
- [ ] **A4.1 Admin shell and guard.** Role check in `proxy.ts` and in server actions. Sidebar, mobile layout.
- [ ] **A4.2 Dashboard.** KPIs, revenue and utilization charts (Recharts, RTL-correct), today's pickups and returns.
- [ ] **A4.3 Products and units.** CRUD with image upload, tiers, deposit, unit condition and status.
- [ ] **A4.4 Bookings.** Pipeline table, detail, state transitions with audit trail, inspection form, damage and late fees, deposit refund.
- [ ] **A4.5 Calendar.** Per-unit timeline of bookings and buffers, drag to reschedule if feasible.
- [ ] **A4.6 Customers and settings.** Customer list with notes and blocklist, policy settings.

## Phase 5 — Launch
- [ ] **L5.1 SEO.** Metadata per route, sitemap, robots, canonical, Product and FAQ JSON-LD, OG images.
- [ ] **L5.2 Performance.** Image sizes, font subsetting, bundle audit (`recharts` only on admin), caching strategy.
- [ ] **L5.3 Accessibility pass.** Keyboard, focus, contrast, reduced motion, screen-reader labels in Persian.
- [ ] **L5.4 Error pages and edge cases.** 404, 500, offline, expired session, payment failure, double submit.
- [ ] **L5.5 E2E.** Playwright flows: browse and book, OTP login, pay (sandbox), cancel, admin transition.
- [ ] **L5.6 Deploy notes.** Env vars, Iranian-reachable hosting, backup, monitoring, `README` for the owner.
