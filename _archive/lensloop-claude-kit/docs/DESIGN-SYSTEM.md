# Design system

Goal: calm, precise, trustworthy, photographic. A tool for people who care about gear. Persian-first, RTL-native (not mirrored LTR), mobile-first.
Brand colors below are a **proposal** (A-7). `/brand` replaces them in one pass (tokens only; components never change).

## 1. Principles
1. Clarity over decoration: price, dates, availability and deposit are always visible where decisions happen.
2. One primary action per screen region. Secondary actions look secondary.
3. Imagery leads (gear photos on neutral backgrounds), UI chrome stays quiet.
4. Every state is designed: loading, empty, error, success, disabled, focus.
5. Motion explains change; it is never required and respects `prefers-reduced-motion`.

## 2. Tokens (`app/globals.css`, Tailwind v4)
Semantic names only in components (`bg-primary`, `text-muted-foreground`). Never raw colors.

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;
  --background: oklch(0.985 0.003 90);   --foreground: oklch(0.2 0.02 265);
  --card: oklch(1 0 0);                  --card-foreground: oklch(0.2 0.02 265);
  --popover: oklch(1 0 0);               --popover-foreground: oklch(0.2 0.02 265);
  --primary: oklch(0.27 0.04 265);       --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.96 0.006 90);     --secondary-foreground: oklch(0.27 0.04 265);
  --muted: oklch(0.955 0.005 90);        --muted-foreground: oklch(0.5 0.02 265);
  --accent: oklch(0.78 0.16 70);         --accent-foreground: oklch(0.22 0.03 70);
  --destructive: oklch(0.577 0.22 27);   --success: oklch(0.62 0.16 150);
  --warning: oklch(0.78 0.15 80);        --info: oklch(0.6 0.13 240);
  --border: oklch(0.91 0.006 90);        --input: oklch(0.91 0.006 90);
  --ring: oklch(0.55 0.15 265);
  --chart-1: oklch(0.55 0.15 265); --chart-2: oklch(0.72 0.15 70); --chart-3: oklch(0.62 0.16 150);
  --chart-4: oklch(0.6 0.13 240);  --chart-5: oklch(0.577 0.2 27);
}
.dark {
  --background: oklch(0.18 0.015 265);   --foreground: oklch(0.96 0.005 90);
  --card: oklch(0.22 0.018 265);         --card-foreground: oklch(0.96 0.005 90);
  --popover: oklch(0.22 0.018 265);      --popover-foreground: oklch(0.96 0.005 90);
  --primary: oklch(0.92 0.01 90);        --primary-foreground: oklch(0.22 0.03 265);
  --secondary: oklch(0.27 0.02 265);     --secondary-foreground: oklch(0.96 0.005 90);
  --muted: oklch(0.27 0.02 265);         --muted-foreground: oklch(0.72 0.02 265);
  --accent: oklch(0.78 0.16 70);         --accent-foreground: oklch(0.22 0.03 70);
  --destructive: oklch(0.7 0.19 22);     --success: oklch(0.72 0.16 150);
  --warning: oklch(0.82 0.14 80);        --info: oklch(0.72 0.12 240);
  --border: oklch(1 0 0 / 12%);          --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.65 0.15 265);
}

@theme inline {
  --color-background: var(--background);   --color-foreground: var(--foreground);
  --color-card: var(--card);               --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);         --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);         --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);     --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);             --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);           --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive); --color-success: var(--success);
  --color-warning: var(--warning);         --color-info: var(--info);
  --color-border: var(--border);           --color-input: var(--input);   --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);              --radius-xl: calc(var(--radius) + 4px);
  --font-sans: var(--font-vazirmatn), ui-sans-serif, system-ui, Tahoma, sans-serif;
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground font-sans antialiased; line-height: 1.8; }
}
```
Rules: when changing any color, re-check contrast (text 4.5:1, large text and UI 3:1) in both themes. Text on `accent` uses `accent-foreground`, never white.

## 3. Typography (Persian)
- Font: Vazirmatn variable, self-hosted with `next/font/local` (Latin digits are formatted into Persian digits by `lib/format.ts`; do not rely on a "FD" font build).
- Weights: 400 body, 500 labels and buttons, 700 headings. No italics. No faux bold.
- **Never** use `tracking-*` (letter-spacing) or `uppercase` on Persian text: it breaks letter joining. Latin brand text may use them sparingly.
- Scale (size / line-height): display 2.5rem/1.3 · h1 2rem/1.4 · h2 1.5rem/1.5 · h3 1.25rem/1.6 · body 1rem/1.8 · small 0.875rem/1.7 · caption 0.75rem/1.6.
- Measure: body text 60–75 characters per line (`max-w-prose`).
- Use ZWNJ (U+200C) in compound words (می‌شود، خانه‌ها). Keep the Persian comma «،» and question mark «؟».
- Mixed content: wrap Latin or numeric runs that must stay LTR (phone, email, serial, model names in running text) in `<bdi>` or `dir="ltr"`.

## 4. Layout and spacing
- 4px base grid. Common steps: 4, 8, 12, 16, 24, 32, 48, 64.
- Container: `mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8`. Design at 390px first.
- Breakpoints: Tailwind defaults (`sm 640`, `md 768`, `lg 1024`, `xl 1280`).
- Section rhythm: `py-10 md:py-16`. Card padding `p-4 md:p-6`.
- Z-index scale: base 0, sticky 20, dropdown 30, overlay 40, modal 50, toast 60. No ad-hoc values.
- Radius: controls `rounded-md`, cards `rounded-lg`, hero media `rounded-xl`, pills `rounded-full`.
- Elevation: flat (border only) by default; `shadow-sm` for cards on hover; `shadow-md` popovers; `shadow-lg` modals.

## 5. Direction and icons
- Logical utilities only (see `rtl-persian-ui` skill). Layout order follows reading order: primary action at the end edge of a form row, back affordance at the start.
- Directional icons (chevrons, arrows, "next/back") flip with `rtl:rotate-180` or are swapped. Non-directional icons (search, cart, user, calendar, camera) never flip.
- Icons: lucide-react, `size-5` default, `size-4` inline in buttons, stroke 1.75, `aria-hidden` when decorative, labelled when alone.
- Progress and sliders fill from the end edge (right) toward the start.

## 6. Motion
Durations 150ms (hover, press), 200ms (popovers, tabs), 300ms (sheets, dialogs). Easing `ease-out`. Skeleton shimmer 1.5s. Everything wrapped so `motion-reduce:` disables transforms and shimmer.

## 7. Components
Built from Radix primitives in `components/ui/*`, variants via `cva`, merged with `cn`. Every component supports `className`, forwards props, and is keyboard accessible. Create a new component only if the inventory below cannot express it.

| Component | Variants / notes | States |
|---|---|---|
| Button | default, secondary, outline, ghost, destructive, link · sm, md (h-10), lg (h-12), icon · `loading` | hover, active, focus-visible, disabled, loading (spinner at start, label kept) |
| Input, Textarea, Select, Combobox | label above, helper below, error with icon in `text-destructive`, `dir="ltr"` for phone/email/code | default, focus, error, disabled, readonly |
| Checkbox, Radio, Switch | Radix; 44px hit area via padding | checked, indeterminate, disabled |
| DatePicker, DateRangePicker | Jalali (`react-day-picker/persian`), week starts Saturday, disabled booked days, price hint per day optional | open, range-partial, invalid |
| Card, ProductCard | image 4:3, name, brand, price per day in Toman, availability badge, favorite | hover, loading skeleton, unavailable |
| Badge, StatusBadge | status map below | — |
| Dialog, Sheet, Drawer | Sheet side=right is the **start** edge in RTL; mobile filters and nav use Sheet | open, closing, focus trap |
| Tabs, Accordion | specs, FAQ | — |
| Toast (sonner) | success, error, info; position bottom-center on mobile, `dir="rtl"` | — |
| Skeleton, EmptyState, ErrorState | every list/table/detail has all three | — |
| Stepper | checkout steps with current/complete/error | — |
| PriceBreakdown | rental, tiers discount, delivery, VAT, deposit (labelled refundable), payable | loading, unavailable |
| Rating | read-only and input | — |
| Pagination, Table (admin) | sticky header, row actions in a menu | loading, empty |
| Chart wrappers | Recharts with RTL fixes, tokens for colors | loading, empty |

### Booking status colors
| Status | Persian label | Badge |
|---|---|---|
| pending_payment | در انتظار پرداخت | warning |
| confirmed | تأیید شده | info |
| ready | آماده تحویل | info |
| active | در حال اجاره | primary |
| overdue | دیرکرد | destructive |
| returned | بازگشت داده شده | secondary |
| completed | تکمیل شده | success |
| cancelled | لغو شده | muted |
| expired | منقضی شده | muted |
| failed | پرداخت ناموفق | destructive |
| disputed | در حال بررسی | destructive |

## 8. Patterns
- **Forms**: one column on mobile, labels above fields, validate on blur then on change after first error, submit button disabled only while pending (never to hide validation), error summary focus on submit failure, preserve input on error. Persian error copy states what to do ("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود").
- **Lists**: skeleton on load, empty state with a next action, error state with retry, URL-synced filters.
- **Overlays**: dialog for decisions, sheet for filters and navigation, popover for small pickers. Always closable with Esc and a visible close button.
- **Feedback**: toast for non-blocking confirmation, inline for field errors, banner for page-level problems.
- **Imagery**: `next/image` with explicit `sizes`, aspect ratio reserved, Persian `alt`. Product 4:3, hero 16:9 desktop and 4:5 mobile.
- **Trust**: deposit explained near price, cancellation policy near pay button, support contact in footer and checkout.

## 9. Dark mode
`next-themes` with `attribute="class"`, system default, no flash. Test every screen in both themes. Photos never inverted; add `bg-muted` behind transparent product PNGs.

## 10. Checklist for any new UI
Tokens only · logical utilities · Persian copy and digits · all states · focus visible · touch targets 44px · works at 390px and 1280px · both themes · no layout shift · screenshot checked.
