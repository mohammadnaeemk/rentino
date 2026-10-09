---
name: rental-domain
description: Rental business logic for Lensloop: inclusive-day counting, tiered pricing, deposit, VAT, availability with buffers, double-booking prevention, booking status machine, cancellation and late fees. Use when touching prices, dates, availability, booking, cart, checkout totals or admin booking actions.
---

# Rental domain skill

Rules and types: `docs/DOMAIN.md`. **Never** re-implement these in components. Logic lives in `lib/domain/*` as pure functions with tests; UI and server actions call them.

## Ready, tested templates (copy, do not rewrite)
In `templates/` (all `.tpl`; copy to `lib/domain/` dropping `.tpl`; tests passed 64/64 against Node's runner):
| Template | Provides |
|---|---|
| `dates.ts` | `rentalDays` (inclusive), `addDays`, `diffDays`, `overlaps`, `eachDay`, `isIsoDate`, `todayInTehran` |
| `pricing.ts` | `Rial` type, `DEFAULT_TIERS`, `rentalFee`, `quote`, `lateFee`, `cancellationRefund` |
| `availability.ts` | `isUnitFree` (buffer + hold expiry), `assignUnits`, `unavailableDays`, `nextAvailableStart` |
| `booking-state.ts` | `TRANSITIONS`, `transition`, `canTransition`, `allowedNext`, `audit`, Persian status labels |
| `*.test.ts` | Vitest suites (import from `"vitest"`). Dates test imports `./dates`; adjust paths if folder differs |

Copy with: `for f in dates pricing availability booking-state; do cp .claude/skills/rental-domain/templates/$f.ts.tpl lib/domain/$f.ts; done` (same for `.test.ts.tpl`).

## Rules to remember
- Money = integer Rial (`Rial`), display Toman via `formatToman`. Never floats, never ×10 by hand.
- Days are inclusive calendar days in Asia/Tehran. Store `YYYY-MM-DD`.
- Deposit is refundable, never discounted or taxed. VAT base = rental - discount + delivery (rate default 0).
- Buffer days (default 1) around every booking; payment holds block for 15 minutes then stop blocking.
- Illegal status transitions throw; every transition writes an audit entry.

## Repository contract (D-004)
```ts
interface BookingRepository {
  listForUser(userId: string): Promise<Booking[]>;
  getByCode(code: string): Promise<Booking | null>;
  /** MUST check availability and insert atomically. Returns conflict if taken. */
  createHold(input: CreateBooking): Promise<{ ok: true; booking: Booking } | { ok: false; reason: "unavailable" | "invalid" }>;
  transition(id: string, to: BookingStatus, by: string, note?: string): Promise<Booking>;
}
```
Mock implementation: in-memory map guarded by a promise-chain mutex; persists to `.data/*.json` in dev only. A real DB must use a serializable transaction or an exclusion constraint on `(unit_id, daterange)`.

## Where logic is called
- Product page and cart: `quote()` for display (client or server, same function), `unavailableDays()` to disable picker days.
- Server action `createBooking`: re-validate input (zod), re-run `assignUnits` and `quote` on the server (never trust client totals), then `createHold`.
- Payment callback: `transition(pending_payment → confirmed)`, idempotent by `authority`.
- Cron/scheduled: expire holds, mark `overdue`, send reminders (route handler + secret header).

## Test-first list (write these before the UI)
Single-day; month and Jalali-year boundaries (Nowruz); adjacent bookings with and without buffer; last unit race (two concurrent `createHold`); hold expiry; double gateway callback; extension into a booked slot; discount > rental; vat with delivery; cancel at exactly 24h; overdue to returned with late fee.
