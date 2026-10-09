# UX flows, routes and microcopy

## 1. Route map (App Router, Persian UI, Latin slugs per D-011)
```
(store)     /                      Home
            /gear                  Catalog (filters in URL: category, brand, price, from, to, sort, page)
            /category/[slug]       Category landing (same list, preset filter)
            /brand/[slug]          Brand landing
            /product/[slug]        Product detail
            /search?q=             Search results
            /faq  /rules  /about  /contact  /privacy
(auth)      /login                 Phone entry
            /login/verify          OTP entry
(checkout)  /cart                  Booking cart
            /checkout/info  /checkout/identity  /checkout/delivery  /checkout/pay
            /checkout/result       Gateway return (success/failure/cancel)
            /booking/[code]        Confirmation (public by code + phone last 4, or logged in)
(account)   /account               Overview
            /account/bookings  /account/bookings/[code]
            /account/profile  /account/favorites
admin       /admin  /admin/bookings  /admin/bookings/[code]  /admin/calendar
            /admin/products  /admin/products/[id]  /admin/customers  /admin/settings
```
Route groups keep layouts separate. `proxy.ts` guards `/account`, `/checkout/*` (except result), `/admin`.

## 2. Principles for flows
- Date range and city are asked once, early, and remembered across pages (URL + cookie).
- Never surprise on price: total with deposit shown from the product page to the pay button, with the same component.
- A user can leave and resume at any step (draft booking is saved).
- Failure is recoverable: payment failure returns to the pay step with the cart intact.
- Minimum fields per step; ask for identity only when needed (at checkout, not before).

## 3. Core flows
### F1. Discover
Home hero (dates + category) → catalog with filters → product. Success: user reaches a product page with their dates preset.
Edge: no results → suggest widening dates, show nearest available dates; unavailable product shows "نزدیک‌ترین تاریخ آزاد" and a notify option.

### F2. Check availability and book
Product page: pick range in Jalali picker → live availability and price breakdown → "افزودن به سبد رزرو" (mobile: sticky bottom bar with total).
Edge: booked days disabled with tooltip; min/max days message; range changes after adding to cart re-validate; unit sold out between add and checkout → clear conflict message with alternatives.

### F3. Login by OTP
Phone (11 digits, `09…`) → send code → 6-digit input with auto-submit, 2-minute resend timer, wrong-code shake-free error text, 5 attempts then lock for 10 minutes.
Edge: Persian/Arabic digits accepted and normalized; paste whole code; return to the page that triggered login.

### F4. Checkout
1. **Info**: name, email optional. 2. **Identity**: national code (checksum validated), ID photo if required by threshold. 3. **Delivery**: pickup (store address, hours) or courier (address, fee by zone). 4. **Review and pay**: breakdown, policy summary and consent checkbox, pay button "پرداخت و ثبت رزرو".
Stepper shows progress; back keeps data. Server re-validates availability on pay.

### F5. Payment
Redirect to gateway → return to `/checkout/result`. Outcomes: success → booking confirmed page; failed → reason + retry; cancelled → return to pay step. Hold expires in 15 minutes with visible countdown at pay step.
Edge: double callback (idempotent), closed tab (booking stays pending until expiry; account shows "ادامه پرداخت").

### F6. After booking
Confirmation: code, dates (Jalali), pickup address and time, checklist (ID, card used for payment), add to calendar, contact. Account detail shows status timeline. Reminder SMS day before pickup and return (provider interface). Extend request checks availability. Cancel shows refund preview first.

### F7. Admin booking handling
Dashboard "امروز" lists pickups and returns → open booking → transition buttons that match the status machine → handover checklist with condition photos → return inspection (condition per unit, late fee auto, damage fee manual) → refund deposit → complete. Every action is audited.

### F8. Admin inventory
Product list → edit (info, images, tiers, deposit) → manage units (serial, condition, status) → calendar shows unit timelines and maintenance blocks.

## 4. Key screens (what must be on them)
**Product page (mobile order)**: gallery · title, brand, rating · price per day + "from" tier hint · date range picker · availability line · price breakdown · what's in the box · specs (tabs) · policies (deposit, cancellation, late fee) · related · reviews. Sticky bottom bar: total + primary button.
**Checkout pay step**: summary of items and dates · breakdown with deposit labelled "ودیعه (قابل بازگشت)" · countdown · policy consent · pay button · support link.
**Account booking detail**: code, status badge, timeline, items, dates, payment, actions allowed by status.

## 5. Microcopy
Tone: respectful, clear, warm; use «شما»; short sentences; no slang, no exclamation overload; verbs on buttons.
Glossary (use consistently):
| Concept | Persian | Notes |
|---|---|---|
| rent / booking | اجاره / رزرو | button: «رزرو کنید»; cart: «سبد رزرو» |
| deposit | ودیعه | always add «(قابل بازگشت)» near price |
| pickup / return | تحویل گرفتن / بازگرداندن | |
| per day | در روز | price: «۲۵۰٬۰۰۰ تومان / روز» |
| available / unavailable | موجود / ناموجود در این تاریخ | |
| late fee / damage | جریمه تأخیر / خسارت | |
| national code | کد ملی | |
Numbers: Persian digits with thousands separator «٬», currency word «تومان» after the number.
Errors: say what happened and what to do. Example: «پرداخت انجام نشد. مبلغی از حساب شما کسر نشده یا تا ۷۲ ساعت بازگردانده می‌شود. دوباره تلاش کنید.»
Empty states: one sentence + one action. Loading: skeletons, no spinner-only pages.
Confirmation dialogs name the object and the consequence («رزرو ۱۲۳ لغو شود؟ مبلغ بازگشتی: …»).

## 6. UX acceptance heuristics (reviewed by `ux-rtl-auditor`)
Primary action obvious · price and dates always visible at decisions · no dead ends · recoverable errors · state preserved on back/refresh · works one-handed at 390px · 44px targets · focus order follows reading order (right to left) · no text truncated without tooltip or wrap.
