---
name: nextjs16-app-router
description: Use before writing any route, layout, data-fetching, or server/client component code in this repo — this project is on Next.js 16 / React 19, which has breaking changes vs. older training data. Points to the vendored docs.
---

This repo pins `next@16.3.0` + `react@19.2.8`. Before writing App Router code
that you're not 100% certain about (caching defaults, `fetch` behavior,
route handler signatures, params as Promises, etc.), check the vendored docs
at `node_modules/next/dist/docs/01-app/` rather than relying on memory —
APIs changed across major versions.

Fast lookups:
- Data fetching / caching: `node_modules/next/dist/docs/01-app/02-guides/`
  (search for `data-fetching`, `caching`).
- Route Handlers: `node_modules/next/dist/docs/01-app/03-api-reference/` →
  `route.md` / `file-conventions/route.md`.
- Testing: `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`.
- In App Router, dynamic route `params` (and `searchParams`) are **Promises**
  that must be `await`ed in Server Components/Route Handlers — don't destructure
  them synchronously like older Next.js versions.
- Route Handlers live at `src/app/api/<name>/route.ts`, export named
  `GET`/`POST`/etc. functions.

Project-specific: existing public pages (`src/app/gear/[slug]/page.tsx`,
`src/app/blog/[slug]/page.tsx`) fetch directly via `fetch(url, { cache: "no-store" })`
against the external Express backend — follow that pattern for new public SSR pages.
