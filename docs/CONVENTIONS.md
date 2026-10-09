# Codebase conventions (read before writing code)

Stack: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4,
shadcn/ui (`new-york` style, see `components.json`), Radix UI, React Hook Form
+ Zod, Sonner toasts, custom typed REST client (no React Query).

## Directory map
- `src/app/**` — routes. Route groups: `(auth)`. Dashboards under
  `src/app/dashboard/{admin,provider,customer}` each with their own `layout.tsx`.
- `src/components/ui/**` — shadcn primitives, generated via `components.json`
  aliases (`@/components`, `@/components/ui`, `@/lib`, `@/hooks`). Don't
  hand-roll a primitive shadcn already provides — add it with the shadcn CLI
  convention (same file shape as existing ones).
- `src/components/{gear,dashboard,providers}/**` — feature components.
- `src/lib/api.ts` — single fetch wrapper (`api.get/post/put/patch/delete`),
  handles JWT refresh-on-401 and typed `ApiResponse<T>`/`ApiRequestError`.
  **Always** add new backend calls through this client, never raw `fetch`
  outside of Server Components doing initial SSR data loads (see
  `src/app/gear/[slug]/page.tsx` for that pattern).
- `src/lib/validations.ts` — all Zod schemas + inferred types, one schema per form.
- `src/lib/gear.ts` — maps raw `ApiGear` (backend shape) to the UI `GearItem` type.
- `src/types/index.ts` — single source of shared domain types (`Role`,
  `GearItem`, `RentalOrder`, `Payment`, `Review`, `BlogPost`, ...).
- `src/lib/auth-context.tsx` — client auth context (JWT + Google OAuth + demo login).

## Conventions to follow
- Backend base URL: `process.env.NEXT_PUBLIC_API_URL` (fallback
  `http://localhost:8000/api`). This is the only backend URL env var — a legacy
  `NEXT_PUBLIC_BACKEND_API_URL` is still read first by `src/app/page.tsx` and
  should be normalized back to `NEXT_PUBLIC_API_URL`.
- New domain types go in `src/types/index.ts`; new validation schemas go in
  `src/lib/validations.ts`; keep both files flat (no barrels per-feature).
- Server Components do SSR fetches directly with `fetch(..., { cache: "no-store" })`
  only for public, unauthenticated pages (blog, gear detail). Anything requiring
  auth/session goes through `src/lib/api.ts` from Client Components.
- Styling: Tailwind utility classes + `cn()` from `src/lib/utils.ts`; no CSS modules.
- Icons: `lucide-react` only (see `src/lib/category-icons.tsx` pattern for
  mapping a string key from the backend to an icon component).
- Forms: `react-hook-form` + `zodResolver` + shadcn `Form` components
  (`src/components/ui/form.tsx`), matching `src/components/gear/gear-form.tsx`.
- Env/server secrets (e.g. `GEMINI_API_KEY`) must never be prefixed
  `NEXT_PUBLIC_` and must only be read inside Route Handlers/Server Actions.

## Before committing
- `npm run lint` must pass (flat ESLint config: `eslint-config-next` core-web-vitals + typescript).
- `npm run build` must succeed for any App Router change (route conflicts,
  type errors across `.next/types` are caught at build time, not lint time).

There is currently **no test runner** installed (no Vitest, no `npm test`), so
no test gate applies yet. When a runner is added, tests for lib functions and
AI-search parsing become required — see `docs/STATUS.md`.
