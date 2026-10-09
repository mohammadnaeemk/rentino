# Lensloop — Product Requirements (draft v0)

> Status: DRAFT written without access to the owner's brief. Items marked **[ASSUMED]** are defaults; `/bootstrap` asks the owner to confirm or change them, then updates this file. Do not block work on assumptions: use the default and record it.

## 1. Vision
Lensloop is an Iranian online store for renting photo/video equipment (cameras, lenses, lighting, audio, drones, accessories). Promise: find the right gear, see real availability, book in under two minutes, pay safely, receive it on time.

## 2. Users
| Persona | Goal | Key needs |
|---|---|---|
| Renter (photographer, filmmaker, student, event shooter) | Get specific gear for specific dates, cheaply | Honest availability, clear total price, small deposit, fast pickup, trust |
| Shop staff / owner (admin) | Keep inventory busy, avoid damage and no-shows | Calendar view, booking pipeline, condition tracking, late/damage handling |

## 3. Business model [ASSUMED]
- Single operator (Lensloop owns the inventory). Not a multi-vendor marketplace.
- Revenue: rental fees. Refundable deposit (ودیعه) per booking. Optional delivery fee.
- Cities: Tehran first. Pickup at the store is default; courier delivery within the city is optional.
- Payment: Iranian online gateway (Zarinpal first). Deposit is paid online with the rental and refunded after inspection [ASSUMED: gateway hold is not available].

## 4. Scope v1
### Storefront (public)
- Home, category and brand browsing, search, filters (category, brand, price, availability for chosen dates), sort.
- Product page: gallery, specs, price tiers, deposit and replacement value, availability calendar (Jalali range picker), what's in the box, related items, reviews.
- Static pages: FAQ, rental rules (قوانین اجاره), about, contact, privacy.
### Booking and checkout
- Booking cart with dates per item or one date range for all [ASSUMED: one range per booking].
- Phone-number OTP login (no password). Google login is optional and hidden by default (often unreachable in Iran).
- Identity (KYC): name, national code (validated), phone. ID photo upload optional [ASSUMED] and required above a deposit threshold.
- Delivery choice, price breakdown, payment, confirmation with booking code and invoice.
### Customer account
- Bookings list and detail with status timeline, extend request, cancel, invoice, profile and KYC, favorites, review after return.
### Admin
- Dashboard (revenue, utilization, upcoming pickups/returns), products and units CRUD, bookings pipeline and calendar, customers, damage and late fees, settings (policies, buffer days, tiers, cities).

## 5. Out of scope v1
Multi-vendor, native apps, insurance integration, live chat, subscriptions, multi-language (Persian only), multi-currency.

## 6. Non-functional requirements
- Mobile-first: design at 390px, enhance to 1280px.
- Works behind filtering: self-host fonts, scripts and images. No Google Fonts, no external CDNs, no blocked analytics at build or runtime.
- Performance: LCP under 2.5s on a mid-range phone on 4G; images via `next/image`, no layout shift.
- SEO: Persian metadata, canonical URLs, sitemap, Product JSON-LD, readable slugs (Persian or transliterated per D-011).
- Accessibility: WCAG 2.2 AA for core flows.
- Security: server-side validation of every input, rate-limited OTP, no secrets in client code, payment verified server-side only.

## 7. Success metrics
Booking conversion from product view, share of bookings with zero support contact, utilization per unit, on-time return rate.

## 8. Assumptions to confirm (asked once by /bootstrap)
| ID | Assumption | Default |
|---|---|---|
| A-1 | Single operator, not marketplace | yes |
| A-2 | Deposit paid online, refunded manually after inspection | yes |
| A-3 | Auth: phone OTP primary | yes |
| A-4 | Backend now: typed mock repositories; real DB later | yes |
| A-5 | One date range per booking | yes |
| A-6 | VAT shown on invoices | no (rate configurable, default 0) |
| A-7 | Brand: name "Lensloop", Persian wordmark «لنزلوپ», palette from design system proposal | yes |
| A-8 | Hosting: Iranian-reachable host or VPS (not Vercel-only) | yes |
