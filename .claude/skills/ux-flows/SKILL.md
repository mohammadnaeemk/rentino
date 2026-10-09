---
name: ux-flows
description: User flows, route map, microcopy glossary and UX heuristics for the Lensloop rental journey (discover, availability, OTP login, checkout, payment, account, admin). Use when building or changing any page, form, flow step, error message or button label.
---

> ⚠️ **Target guidance** — merged from the archived kit. Flow/glossary details at
> `_archive/lensloop-claude-kit/docs/UX-FLOWS.md`. The OTP/checkout steps assume
> the kit's single-operator model; adapt to the multi-vendor model.

# UX flows skill

Authoritative flows, routes and glossary: `docs/UX-FLOWS.md` (Grep the flow you need, e.g. `F4`, `Microcopy`). This skill is how to apply them.

## Before building a screen
1. Name the user, the goal and the single primary action.
2. Locate it in the route map; keep the route group and layout consistent.
3. List data it needs and every state (loading, empty, error, partial, success, unauthorized).
4. Decide what persists across back/refresh (URL params, cookie, draft booking).

## Rules that decide most UX questions
- **Price honesty**: show the same `PriceBreakdown` from product page to pay button; deposit is labelled «ودیعه (قابل بازگشت)».
- **Dates once**: the chosen range lives in URL (`?from=2026-10-10&to=2026-10-12`) and a cookie; every page that shows availability or price reads it.
- **Minimum friction**: no account to browse or check price; login at checkout start; identity only at the step that needs it; save progress.
- **Recoverable errors**: every error says what happened and the next action; payment failure returns to pay with the cart intact; never lose typed input.
- **Progressive disclosure**: policies in an accordion near the decision, not a wall of text.
- **One primary action** per view (filled `Button`); the rest secondary/ghost.
- **Feedback**: pending state on submit (button spinner, disabled), success toast or confirmation page, failure inline plus focus on first error.
- **Lists**: URL-synced filters, skeleton, empty-with-action, error-with-retry, pagination or "load more" (not infinite scroll for catalog).
- **Mobile**: thumb zone for primary actions (sticky bottom bar), filters in a sheet, inputs with right `inputMode`/`autocomplete`/`enterKeyHint`.

## Forms with react-hook-form + zod
```tsx
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), mode: "onTouched" });
```
Schema in `lib/schemas/*` shared with the server action; messages in Persian; server errors mapped to fields via `form.setError`; submit button shows pending from `form.formState.isSubmitting` or `useActionState`. Use `autoComplete` (`tel`, `name`, `one-time-code`), `inputMode="numeric"` for codes, `dir="ltr"` for phone/code.

## Microcopy
Use the glossary in `docs/UX-FLOWS.md` §5. Tone: polite «شما», short, concrete, verbs on buttons («رزرو کنید»، «ادامه»، «پرداخت و ثبت رزرو»). Error pattern: «چه شد + چه کنید». Avoid: exclamation marks pile-up, slang, English words where a Persian one exists, blame.
Draft long copy (FAQ, rules, about) with the `persian-copywriter` agent.

## Trust elements for Iranian users
Physical address and phone visible; clear cancellation and deposit rules; payment via known gateway logo/name; invoice; response time promise; enamad/samandehi badges as slots in footer (owner supplies).

## Review heuristics (what `ux-rtl-auditor` checks)
Primary action obvious · price/dates visible at decisions · no dead end · recoverable errors · state survives refresh · one-handed at 390px · targets 44px · focus order matches reading order · no truncation without recourse.
