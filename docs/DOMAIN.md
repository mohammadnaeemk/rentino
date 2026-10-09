# Domain model (from `src/types/index.ts`, verified)

Multi-vendor rental marketplace. Roles: `CUSTOMER | PROVIDER | ADMIN`.

## Entities (actual)
- `User` — id, name, email, role, status (`ACTIVE | SUSPENDED`).
- `Category` — id, name, slug, icon.
- `GearItem` — a listing: title, slug, brand, `categoryId`, `providerId`,
  `pricePerDay`, `specs: Record<string,string>`, `availability`
  (`AVAILABLE | RENTED | MAINTENANCE`), `stock`, `rating`, `reviewCount`.
- `RentalOrder` + `RentalOrderItem` — customer order: `items[]`, `startDate`,
  `endDate`, `totalAmount`, `status`.
- `RentalStatus` — `PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED`,
  plus `CANCELLED`.
- `Payment` — `STRIPE | SSLCOMMERZ` (imported); target is a simulated flow.
- `Review`, `BlogPost`, `Paginated<T>`, `ApiError`.

## Category attributes (target)
Data-driven, not per-category code: `Category` + `specifications` JSON on
`GearItem`. Target categories: cars, consoles, bikes, cameras, and other goods.

## Availability & order lifecycle — TODO
Invariants for the multi-vendor `Gear/RentalOrder` model (availability windows,
double-booking prevention, deposit, status transitions) are **not yet derived**.
The archived single-operator kit (`_archive/lensloop-claude-kit/docs/DOMAIN.md`)
has reference *concepts* (inclusive day counting, buffers, atomic holds) that
must be re-mapped to this model before use — do not import its entities.
