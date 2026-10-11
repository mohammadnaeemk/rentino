---
name: web-testing
description: Use when you need to verify that a page, form, or user flow in this Next.js app actually works — rendering, console errors, RTL/Persian correctness, responsive layout, network calls — before claiming it works. Also use when a page renders blank, throws hydration errors, or looks wrong in the browser.
---

# Web testing (browser verification)

## Core principle

**A page is not verified until a real browser loaded it.** Reading the source,
grepping for the component, or passing `npm run build` tells you the code
*compiles* — not that the page *renders*. Most bugs in this app (blank lists,
unwrapped API envelopes, hydration mismatches, RTL flips, 404 detail pages)
only appear at runtime.

There is **no committed e2e suite and no test runner** in this repo
(`docs/STATUS.md`). Browser verification via Playwright MCP is the only
end-to-end check that exists. Use it.

## Prerequisites

| What | How to check | Expected |
|---|---|---|
| Frontend | `lsof -nP -iTCP:3000 -sTCP:LISTEN` | a `node` process listening |
| Backend | `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/v1/gear` | `200` |
| Base URL | `.env.local` → `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` |

Use a real endpoint like `/api/v1/gear` — the API root `/api/v1` returns `404`
even when the backend is perfectly healthy, so it is a useless probe.

If the frontend isn't up: `npm run dev` (background). If the backend is down,
say so explicitly — a page that fails only because the API is unreachable is
**not** a UI bug, and you must not report it as one.

If `browser_navigate` returns `Browser is already in use`, another session holds
the shared browser. Retry shortly, or fall back to headless Chrome
(`chrome --headless --dump-dom --screenshot`) plus `curl` — a busy browser is a
reason to use a different tool, **never** a reason to skip verification.

## The loop

For each page: **navigate → snapshot → read console → interact → screenshot.**

1. `browser_navigate` to the URL.
2. `browser_snapshot` — this is the accessibility tree, your source of truth for
   structure and text. It is cheap and precise; prefer it over screenshots for
   finding elements.
3. `browser_console_messages` with level `error` — **never skip this.** A page
   can look perfect and still be logging hydration errors or failed fetches.
4. Interact: `browser_click`, `browser_type`, `browser_fill_form`,
   `browser_select_option`, `browser_press_key`. After a submit, `browser_wait_for`
   the expected text rather than guessing a sleep.
5. `browser_take_screenshot` when layout/visual correctness is the question
   (RTL alignment, dark mode, overflow). Snapshot first, screenshot second.
6. For data pages, `browser_network_requests` (filter `/api/`) to confirm the
   call succeeded and the response shape matches what the component expects.

## What to check on every page (this project)

- **Not blank / not the error boundary.** Loading and error states are distinct
  from success — name which one you actually saw.
- **Console is clean** of errors and React hydration warnings.
- **RTL + Persian**: `dir="rtl"` is inherited, text is Persian not English,
  digits render through `lib/format.ts`, layout is not mirrored wrongly.
- **Dynamic routes resolve**: `/gear/[slug]` and `/blog/[slug]` need a real slug
  from the list page — visiting a made-up slug must give a proper 404, not a crash.
- **URL params actually drive the view.** Much of this app passes state in the
  query string — the home page's category tiles link to `/gear?category=<slug>`.
  Open the URL *the link produces* and confirm the view changed (compare the item
  count against the unfiltered page). A page that renders perfectly while silently
  ignoring `?category=`/`?q=` is a real bug that no "it renders" check catches.
  Verified gap as of 2026-10: `/gear` has no `useSearchParams`, so category
  deep-links are ignored.
- **Empty/error states**: a list backed by an empty or failing API must show its
  empty/retry UI, not a silent blank.
- **Responsive**: `browser_resize` to 390×844 (mobile) and check the primary
  action is reachable and nothing overflows horizontally.

## Key routes

`/` · `/gear` (`?category=<slug>`, `?q=<text>`, `?page=N`) · `/gear/[slug]` ·
`/login` · `/register` · `/blog` ·
`/blog/[slug]` · `/dashboard/{customer,provider,admin}` · `/payment/success` ·
`/payment/cancel` · `/about` · `/contact` · `/help` · `/how-it-works` ·
`/privacy` · `/terms`

## Report shape

Give, per page, in this shape — no prose dumps:

```
/gear — ✅ loads, 9 cards, console clean
/gear/rentino-camera — ❌ console: "Cannot read properties of undefined (reading 'price')"
/login — ⚠️ renders, but layout overflows at 390px
```

Then state exactly what you did **not** verify. "I checked /gear and /login"
is a different claim from "the app works".

## Red flags — STOP

- About to write "the page works" without a `browser_navigate` in this session.
- Inferred the UI from reading the component or from `npm run build` passing.
- Took a screenshot but never read `browser_console_messages`.
- Saw an empty page and assumed "no data" instead of checking the network call.
- Confirmed a page renders, but never opened the URL a link on another page
  actually produces (deep link, filter, pagination).
- Reported an API-down failure as a UI bug.

**Any of these mean: open the browser and actually look.**
