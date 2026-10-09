---
name: iran-integrations
description: Iran-specific integrations and constraints for Lensloop: phone OTP login, SMS providers, Zarinpal payment gateway flow, national-code/Sheba/card validation, offline-safe assets, and hosting limits. Use when building auth, payment, SMS, KYC, identity forms, or anything that calls an external service.
---

> ⚠️ **Target guidance** — merged from the archived kit. Phone-OTP/Zarinpal are
> the kit's assumptions; the current plan is a **simulated** payment flow and
> Google OAuth is already present. Apply the Iran environment constraints
> (blocked services, self-host assets) now; gate the rest on product decisions.

# Iran integrations skill

## Environment constraints (design for them)
- Many foreign services are blocked or flaky from Iran: Google Fonts, Google Analytics, reCAPTCHA, Google OAuth, many CDNs, Stripe/PayPal. Self-host fonts and assets; no third-party scripts at runtime (D-002).
- Google login (`@react-oauth/google`, `jwt-decode`) stays behind `NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN` (default off, D-006). Phone OTP is primary.
- Captcha: use own rate limiting plus a simple honeypot/time check; do not add reCAPTCHA. If needed later, an Iranian-reachable option.
- Server must reach the gateway and SMS provider from its network; the owner chooses hosting (A-8). Keep every external call behind an interface so providers can be swapped.

## Validators and OTP (tested templates)
Copy from `templates/` (drop `.tpl`): `validators.ts` → `lib/validators.ts`; `otp.ts` → `lib/auth/otp.ts`; tests alongside. Verified (64 tests across kit templates pass).
- `normalizePhone`, `isValidMobile` accept `+98`, `0098`, `98`, `9…`, Persian/Arabic digits.
- `isValidNationalCode` (checksum), `isValidSheba` (mod 97), `isValidCardNumber` (Luhn).
- Wrap them in zod: `z.string().transform(normalizePhone).refine(isValidMobile, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود")`. Put shared schemas in `lib/schemas/common.ts`.

## OTP login flow (server actions, `lib/auth/*`)
1. `requestOtp(phone)`: validate, check `canResend` and IP+phone rate limit, `generateOtp`, store `hashOtp(code, phone, PEPPER)` with TTL 120s, send via `SmsProvider`. Respond identically whether or not the phone exists.
2. `verifyOtp(phone, code)`: `checkOtp` decides; persist `next` record; on ok create or fetch user and set session.
3. Session: signed, `httpOnly`, `secure`, `sameSite=lax` cookie (use `jose` only if a dependency is justified; otherwise Node `crypto` HMAC). Short-lived access + refresh or a server-side session id; rotate on login.
4. Route protection in `proxy.ts` (Next 16): read cookie, redirect to `/login?next=…`; real authorization again inside server actions and data access.
5. Dev mode (`NODE_ENV!=="production"`): `ConsoleSmsProvider` logs the code. Never log codes in production.
```ts
export interface SmsProvider { sendOtp(phone: string, code: string): Promise<void>; sendText(phone: string, text: string): Promise<void> }
```
Providers (owner picks; all need API key, sender line and approved template): Kavenegar, Ghasedak, SMS.ir, Melipayamak. Use the provider's verify/lookup (template) endpoint for OTP, not free text. Implement one adapter, keep the interface.
Env: `OTP_PEPPER`, `SESSION_SECRET`, `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_SENDER`.

## Payment: Zarinpal flow
Docs could not be fetched while preparing this kit (site blocks automated readers). **Before coding, confirm endpoints and fields in the official Zarinpal docs** and record them in `docs/DECISIONS.md`. Expected v4 shape:
1. Server: `POST …/pg/v4/payment/request.json` with `merchant_id`, `amount`, `currency` (IRR or IRT: be explicit and consistent with `Rial`), `callback_url`, `description`, `metadata.mobile`. Response `data.code === 100` and `data.authority`.
2. Save `Payment{ bookingId, authority, amount, status:"pending" }`, then redirect the user to `…/pg/StartPay/{authority}` (sandbox host for testing).
3. Callback `GET /api/pay/zarinpal/callback?Authority=…&Status=OK|NOK`: look up the payment by authority; never trust query params for success.
4. If `Status=OK`: `POST …/pg/v4/payment/verify.json` with `merchant_id`, `amount` (from **your** DB, not the URL), `authority`. Code `100` = paid, `101` = already verified (treat as success, idempotent). Store `ref_id`, card mask, then transition booking `pending_payment → confirmed` in one transaction.
5. Redirect the browser to `/checkout/result?code=<bookingCode>`; the page reads state from the DB.
Rules: amount integer, server-side only; verify within the gateway time window; handle double callback; hold expiry may pass while on the gateway page (if payment succeeds after expiry, confirm if units still free, otherwise auto-refund path and tell the user); log gateway responses without secrets; `ZARINPAL_MERCHANT_ID` only in env.
Gateway interface so another PSP (IDPay, NextPay, Zibal, Sep) is a drop-in:
```ts
export interface PaymentGateway {
  start(input: { bookingCode: string; amount: Rial; mobile?: string; callbackUrl: string }): Promise<{ authority: string; redirectUrl: string }>;
  verify(input: { authority: string; amount: Rial }): Promise<{ ok: boolean; refId?: string; alreadyVerified?: boolean; cardPan?: string }>;
}
```
Provide `MockGateway` for dev and tests (instant success/fail by amount suffix). Deposit refunds are manual or via PSP settlement features: record intent in the booking audit and show the admin a "refund pending" task (A-2).

## KYC and privacy
Collect the minimum: national code, name, phone; ID photo only above the threshold. Store uploads outside `public/`, serve through an authorized route, restrict to staff. Mask national code in UI (`001****419`). Never log personal data. Provide an account-delete/data request path in `/privacy`.

## Notifications
SMS reminders (day before pickup and return, overdue) via `SmsProvider.sendText` from a scheduled route handler protected by `CRON_SECRET`. Templates in Persian; keep under 70 chars where possible (Persian SMS segments are short).

## Hosting notes for the owner (put in README at L5.6)
Iranian-reachable VPS or PaaS; Node 20+; reverse proxy with TLS; persistent storage for uploads and DB; backups; set all env vars; set `NEXT_TELEMETRY_DISABLED=1`; no calls to blocked domains at build time (fonts local, no `next/font/google`).
