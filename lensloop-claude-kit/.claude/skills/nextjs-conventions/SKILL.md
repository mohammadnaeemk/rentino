---
name: nextjs-conventions
description: Next.js 16 / React 19 / Tailwind v4 conventions for Lensloop: folder layout, Server vs Client Components, async request APIs, server actions with zod, proxy.ts, data repositories, caching, metadata/SEO, error and loading UI, and performance rules. Use when creating routes, layouts, actions, data access or metadata.
---

# Next.js conventions

Versions come from package.json: Next 16, React 19.2, Tailwind v4, zod 3. If an API detail is uncertain, query context7 (`next`, `react`) rather than guessing; training data may predate these releases.

## Layout
```
app/
  (store)/…  (auth)/…  (checkout)/…  (account)/…  admin/…   route groups with their own layout.tsx
  api/pay/zarinpal/callback/route.ts   gateway callback, cron routes
  layout.tsx  globals.css  not-found.tsx  error.tsx  sitemap.ts  robots.ts  manifest.ts
components/ui/       primitives (shadcn-style)       components/shared/  composed, reusable
components/<feature>/  feature-specific
lib/ domain/ data/ schemas/ auth/ format.ts validators.ts utils.ts copy.ts
proxy.ts             auth gate (replaces middleware.ts in Next 16)
```
Import alias `@/*`. One component per file; file names kebab-case; components PascalCase.

## Server vs Client
- Default Server Component. Fetch data directly there via repositories (`lib/data`). No `useEffect` data fetching.
- `"use client"` only for interactivity (pickers, forms with live state, menus). Keep client islands small; pass serializable props; never import server-only code (`node:crypto`, repositories with secrets) into them. Mark server modules with `import "server-only"`.
- Promote shared interactive state to URL search params when it should be shareable (filters, dates, page).

## Async request APIs (Next 15+)
```tsx
export default async function Page({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>>;
}) { const { slug } = await params; const sp = await searchParams; … }
const c = await cookies(); const h = await headers();
```
Dynamic APIs opt the route into dynamic rendering; use deliberately.

## Server actions
```ts
"use server";
import { z } from "zod";
export async function createBooking(_: State, fd: FormData): Promise<State> {
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const user = await requireUser();                 // authorize here, not only in proxy.ts
  // re-run domain rules on the server; never trust client totals
  …
  revalidatePath("/account/bookings");
  return { ok: true, code };
}
```
Client: `useActionState` + `useFormStatus`/`isPending`, or react-hook-form calling the action. Return typed results instead of throwing for expected failures; `redirect()` only after success. Rate-limit sensitive actions (OTP, payment start).

## proxy.ts
Runs at the edge of the request for cheap checks only: cookie presence, redirects (`/account`, `/checkout/*`, `/admin`). Real authorization and role checks live in server code. Keep the `matcher` tight to avoid running on static assets.

## Data and caching
Repository returns plain typed objects. Public catalog pages: static or `revalidate` with tags (`revalidateTag("products")` after admin edits). Availability and prices at pay time: always dynamic and re-validated. Do not cache per-user pages.

## Loading, error, not-found
Every route segment with data: `loading.tsx` (skeleton matching layout), `error.tsx` (client, retry with `reset`), `not-found.tsx` Persian. Use `<Suspense>` to stream slow sections (reviews, related).

## Metadata and SEO
`generateMetadata` per page with Persian title/description, canonical, OpenGraph; `title.template: "%s | لنزلوپ"`. `sitemap.ts` from the repository; `robots.ts` blocks `/admin`, `/account`, `/checkout`. Product JSON-LD `Product` + `Offer` (`priceCurrency: "IRR"`), FAQ JSON-LD on FAQ. Use `lang="fa"`.

## Performance rules
`next/image` with `sizes`; fonts via `next/font/local` with `display: swap`; dynamic import heavy client libs (`recharts` only in admin, date picker lazy on product page); avoid client-side waterfalls; no unused dependencies; keep client bundle per route small (check `next build` output).

## Styling
Tailwind v4 CSS-first: tokens in `@theme inline` in `globals.css`; no `tailwind.config.*`. Class merging with `cn` (clsx + tailwind-merge). Dark mode class-based via next-themes (`@custom-variant dark`).

## Errors and logging
Never expose stack traces or provider errors to users; map to Persian messages. Log with a small `logger` that strips secrets and personal data.

## Typing
`strict` TypeScript, no `any`; zod types as the source for form/action types (`z.infer`); discriminated unions for results. Brand `Rial` and `IsoDate`.
