# Domain model and rules

Source of truth for rental logic. Code lives in `lib/domain/` (pure functions, fully unit-tested) and `lib/data/` (repositories). UI never re-implements these rules.

## Entities
```ts
type Rial = number & { readonly __brand: "Rial" };   // integer, never float
type IsoDate = string;                                // "2026-10-08" calendar day (no time)
type IsoDateTime = string;                            // UTC

interface Category { id: string; slug: string; nameFa: string; parentId?: string; order: number }
interface Brand    { id: string; slug: string; nameFa: string; nameEn: string }

interface Product {
  id: string; slug: string; nameFa: string; nameEn?: string;
  categoryId: string; brandId: string;
  descriptionFa: string; specs: { labelFa: string; valueFa: string }[];
  inTheBoxFa: string[]; images: { src: string; altFa: string }[];
  dailyRate: Rial;                 // base price for 1 day
  tiers: PriceTier[];              // see Pricing
  deposit: Rial;                   // refundable
  replacementValue: Rial;          // used for damage/loss cap
  minDays: number; maxDays: number;
  active: boolean;
}
interface PriceTier { fromDay: number; multiplier: number }   // e.g. {fromDay:3, multiplier:0.9}

interface Unit { id: string; productId: string; serial: string; condition: "new"|"good"|"fair"|"repair"; status: "available"|"maintenance"|"retired" }

interface User { id: string; phone: string; name?: string; nationalCode?: string; kyc: "none"|"pending"|"verified"|"rejected"; role: "customer"|"admin"|"staff" }

interface Booking {
  id: string; code: string;                 // human code, e.g. LL-4F7K2
  userId: string; items: BookingItem[];
  start: IsoDate; end: IsoDate;             // inclusive calendar days
  status: BookingStatus;
  delivery: { method: "pickup"|"courier"; address?: string; fee: Rial };
  totals: { rental: Rial; discount: Rial; delivery: Rial; vat: Rial; deposit: Rial; payable: Rial };
  createdAt: IsoDateTime; expiresAt?: IsoDateTime;   // payment hold
}
interface BookingItem { productId: string; unitId: string; qty: 1 }   // one row per unit
interface Payment { id: string; bookingId: string; gateway: "zarinpal"; authority: string; refId?: string; amount: Rial; status: "pending"|"paid"|"failed"|"refunded"; paidAt?: IsoDateTime }
```

## Dates and day counting
- A rental covers calendar days from `start` to `end` inclusive. `days = diffInDays(end, start) + 1`. (D-005)
- Pickup on `start`, return by end of `end` (store closing time from settings).
- All date math uses calendar days in `Asia/Tehran`. Store `IsoDate` as Gregorian; show Jalali. Never do date math on Jalali strings.

## Availability
A unit is available for `[start, end]` if it is `status = available` and no booking in an active status (`pending_payment` with unexpired hold, `confirmed`, `ready`, `active`, `overdue`) overlaps `[start - buffer, end + buffer]`. `buffer` = settings `bufferDays` (default 1, for inspection and prep). A product is available for a range if at least `qty` units are.

```ts
// overlap of two inclusive ranges
const overlaps = (aS: IsoDate, aE: IsoDate, bS: IsoDate, bE: IsoDate) => aS <= bE && bS <= aE;
```
Double-booking protection: check and create in one atomic step. Mock repository uses a mutex; a real database must use a transaction with serializable isolation or an exclusion constraint on (unit, daterange).

## Pricing
- Tiered daily multiplier applied per day: day number `d` uses the multiplier of the highest tier with `fromDay <= d` (default 1).
- Default tiers (per product, editable): from day 1 ×1.0, from day 3 ×0.9, from day 7 ×0.8, from day 14 ×0.7.
- `rental = round(sum over days of dailyRate × multiplier(d))` per unit, rounded to the nearest 1,000 Rial.
- `deposit = sum of product.deposit` (refundable, not discountable, not taxed).
- `vat = round(rate × (rental - discount + delivery))`, rate from settings (default 0, A-6).
- `payable = rental - discount + delivery + vat + deposit`.
- Late fee: `1.5 × dailyRate` per overdue day, per unit. Damage fee capped at `replacementValue`.
- UI shows Toman: `toman = rial / 10`. Always via `formatToman`.

## Status machine
```
draft → pending_payment → confirmed → ready → active → returned → completed
                │              │         │       │         └→ disputed → completed
                ├→ expired     └→ cancelled      └→ overdue → returned
                └→ failed (payment)
```
| From | To | Trigger | Rule |
|---|---|---|---|
| draft | pending_payment | customer starts payment | holds units for 15 min (`expiresAt`) |
| pending_payment | confirmed | gateway verify OK | idempotent by `authority` |
| pending_payment | expired / failed | timeout / gateway fail | release units |
| confirmed | ready | staff | gear prepared and tested |
| confirmed/ready | cancelled | customer or staff | refund per cancellation policy |
| ready | active | staff at handover | identity checked, condition photos taken |
| active | overdue | system | now > end of `end` |
| active/overdue | returned | staff | late fee computed |
| returned | completed | staff after inspection | deposit refunded minus damage/late |
| returned | disputed | staff | damage above deposit or disagreement |

Every transition writes an audit entry `{bookingId, from, to, by, at, note}`. Transitions are pure functions in `lib/domain/booking-state.ts`; illegal transitions throw.

## Cancellation policy (settings, defaults)
Free until 24h before `start`. 50% of rental fee after that. No refund after handover. Deposit always refunded on cancel before handover.

## Edge cases to test
Single-day rental; range crossing month and Jalali year end; range crossing DST (Iran has no DST since 2022 but use calendar-day math); adjacent bookings with buffer; two users booking the last unit simultaneously; hold expiry while on the gateway page; gateway callback arriving twice; extending into an already booked slot.
