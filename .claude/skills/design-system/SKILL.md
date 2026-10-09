---
name: design-system
description: Lensloop visual system and UI craft rules: tokens, typography, spacing, component inventory and states, patterns for forms, lists and overlays, dark mode, plus a pre-ship UI checklist. Use when creating or restyling any component, page or layout, or when changing brand colors.
---

> ⚠️ **Target guidance** — merged from the archived kit. The token spec lives at
> `_archive/lensloop-claude-kit/docs/DESIGN-SYSTEM.md` (not yet implemented in
> `src/app/globals.css`). Paths like `components/shared/` refer to a planned
> layout; actual components are under `src/components/`.

# Design system skill

Spec lives in `docs/DESIGN-SYSTEM.md` (tokens, scale, component table, status colors). Read the section you need with Grep + offset, not the whole file.

## How to build UI here
1. **Reuse first.** Check `components/ui/*` and `components/shared/*`. Extend a variant with `cva` before creating a component.
2. **Tokens only.** Colors from semantic classes (`bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`). No hex, no `rgb()`, no arbitrary px for spacing/radius; use the scale (4/8/12/16/24/32/48/64). The hook blocks raw colors.
3. **Mobile first.** Write the 390px layout, then add `md:` and `lg:`. Target 44px touch height (`h-11`) on tappable controls.
4. **Composition.** Small components, `className` merged through `cn()`, props forwarded, `forwardRef` not needed in React 19 (ref is a prop).
5. **Every state.** default, hover, active, focus-visible, disabled, loading, error, empty. Focus ring: `focus-visible:ring-2 ring-ring ring-offset-2`.
6. **Distinct, not generic.** Follow the `frontend-design` skill for composition and hierarchy: strong type contrast, generous whitespace, real photography, one accent color used with intent. No default-template gradients, no icon-in-circle feature grids unless they carry content.
7. **Persian copy** comes from `ux-flows` glossary. Never lorem ipsum, never English UI text.

## Component recipe (shadcn-style)
```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: { tone: { neutral: "bg-secondary text-secondary-foreground", success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-foreground", danger: "bg-destructive/15 text-destructive" } },
  defaultVariants: { tone: "neutral" },
});
export function Badge({ tone, className, ...p }: React.ComponentProps<"span"> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone }), className)} {...p} />;
}
```

## Layout patterns
- Page shell: header (sticky, `z-20`), `main` with container `mx-auto max-w-7xl px-4 md:px-6 lg:px-8`, footer.
- Product grid: `grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6`.
- Form row: label, control, helper/error; actions at the end edge; full-width primary button on mobile.
- Sticky mobile action bar: `fixed inset-x-0 bottom-0 border-t bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur`; add bottom padding to page so content is not hidden.
- Empty state: icon, one sentence, one action. Error state: what happened, retry. Skeleton mirrors final layout dimensions (no layout shift).

## Imagery and performance
`next/image` with `sizes`, `placeholder="blur"` for hero where possible, explicit aspect ratio containers, Persian `alt`. Lazy-load below the fold. No images from third-party hosts (D-002); put files in `public/` or the storage layer.

## Brand change
`/brand` edits only the token block in `app/globals.css` and the logo files; verify contrast in both themes; run the UI gallery `/dev/ui`.

## Pre-ship checklist
Tokens only · logical utilities · Persian copy and digits · all states · focus visible · 44px targets · 390px and 1280px · light and dark · no layout shift · `prefers-reduced-motion` respected · screenshot looked at. Anything unchecked is reported to the user, not silently skipped.
