---
name: rtl-persian-ui
description: How to build correct Persian (fa-IR) right-to-left UI in Next.js with Tailwind v4 and Radix: logical utilities, directional icons, bidi text, Persian digits, Jalali dates, Vazirmatn font, and RTL fixes for Radix/Sonner/Recharts/date pickers. Use for any UI, layout, text or date/number display work.
---

> ✅ **Applied** — `src/app/layout.tsx` is `lang="fa" dir="rtl"` with self-hosted
> Vazirmatn, and `rtl-scan` reports 0 hard violations. Use this skill to keep new
> work correct and to judge the advisory items tools can't (icons, overlays,
> charts). Templates in `templates/` copy to `src/lib/` (drop `.tpl`) if the
> formatters aren't there yet.

# RTL + Persian UI

Enforced by tooling: the `PostToolUse` edit hook (`.claude/hooks/check-edit.mjs`),
`node .claude/scripts/rtl-scan.mjs`, `node .claude/scripts/rtl-codemod.mjs --write`.
This skill explains the why and the cases tools cannot judge.

## Root setup (once, task F0.2)
```tsx
// app/layout.tsx
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { DirectionProvider } from "radix-ui";
import { Toaster } from "@/components/ui/sonner";

const vazir = localFont({
  src: "../public/fonts/Vazirmatn[wght].woff2", // variable font, self-hosted (D-002)
  variable: "--font-vazirmatn", display: "swap", weight: "100 900",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazir.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DirectionProvider dir="rtl">{children}<Toaster dir="rtl" /></DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```
Font file: download Vazirmatn variable woff2 into `public/fonts/` (the user must supply it if the sandbox cannot; never link a CDN). For leftover template code run the codemod: `node .claude/scripts/rtl-codemod.mjs --write`.

## Logical utility map (use right column)
| Physical | Logical |
|---|---|
| `ml-* mr-*` `pl-* pr-*` | `ms-* me-*` `ps-* pe-*` |
| `left-* right-*` | `start-* end-*` |
| `text-left/right` | `text-start/end` |
| `border-l/r` | `border-s/e` |
| `rounded-l/r`, `rounded-tl…` | `rounded-s/e`, `rounded-ss/se/es/ee` |
| `float-left/right` | `float-start/end` |
| `space-x-*` | `gap-*` in flex/grid |
| `-translate-x-1/2` centering | keep (symmetric); but directional slide: `ltr:` / `rtl:` variants |
Tailwind variants: `rtl:` and `ltr:` exist for the unavoidable cases (`rtl:rotate-180`, `rtl:-scale-x-100`).

## Icons
Flip: chevrons, arrows, "back/next", progress arrows, reply, send, list-indent. Do not flip: search, user, cart, calendar, camera, clock, play (media), check, plus, close, star, heart, phone, brands. Apply `rtl:rotate-180` on the icon. A "previous/next" pair swaps meaning, not just glyph: in RTL "next" is on the left.

## Text and numbers
- Digits: always format via `lib/format.ts` (`formatNumber`, `formatToman`, `toFaDigits`). Inputs accept any digit script: `parseDigits()` before validating. Never store Persian digits.
- Phone, email, URLs, codes, serials, SKU in running Persian text: `<bdi>` or `dir="ltr"`; inputs for them: `dir="ltr"` and `className="text-start"` with `inputMode`.
- Mixed punctuation: Persian comma «،», question mark «؟», guillemets «». ZWNJ (U+200C) in compounds (می‌خواهم، کتاب‌ها).
- No `tracking-*`, no `uppercase`, no italic, no `text-justify` for Persian. Line-height 1.7-1.9. `max-w-prose` for paragraphs.
- Truncation: `truncate` works in RTL; for multi-line use `line-clamp-*`. Do not clip diacritic-heavy text with tight line-height.
- Currency: number then «تومان» with NBSP. Ranges: «۱۶ تا ۱۸ مهر ۱۴۰۵».

## Dates (D-007)
Store `YYYY-MM-DD` Gregorian or UTC ISO. Display with `formatJalali`, `formatJalaliRange`, `formatJalaliWeekday`, `formatRelative`. Never `dateStyle:"full"` with `fa-IR-u-ca-persian` (scrambled order, covered by test). Never do arithmetic on Jalali strings. Persian week starts Saturday; weekend Friday. Picker: `react-day-picker` v10 Persian build (`import { DayPicker } from "react-day-picker/persian"`, `dir="rtl"`, `weekStartsOn={6}`); verify the export path in context7 before using, versions move. Month names via Intl, not hard-coded.

## Component quirks in RTL
- **Radix**: wrap in `DirectionProvider`; `Select`, `DropdownMenu`, `Popover`, `Tooltip` take `dir`; `side="right"` in Radix is physical. Prefer `side="bottom"` or `align="start"`. Dropdown/menu sub-menus open to the left.
- **Sheet/Drawer**: `side="right"` is physical; "start edge" is right in RTL. Mobile nav opens from the right (start). Check slide animation classes (`slide-in-from-right`) match.
- **Dialog close button**: position with `end-4 top-4`, not `right-4`.
- **Tabs/Accordion**: chevron rotation classes still apply; check arrow-key direction (Radix handles with `dir`).
- **Slider/Progress**: need `dir="rtl"` so fill goes from the right. Progress built on `translateX(-n%)` needs `rtl:` flip or `scale-x`.
- **Carousel (embla)**: pass `direction: "rtl"`; arrows swapped.
- **Sonner**: `<Toaster dir="rtl" position="bottom-center" />`; check swipe direction.
- **Recharts**: no native RTL. Set `<XAxis reversed />` for time axes that should run right to left, put `<YAxis orientation="right" />`, mirror tooltip alignment with `dir="rtl"` wrapper, and format ticks with `formatNumber`/Jalali. Wrap legends in `dir="rtl"`. Charts keep `dir="ltr"` only when reversal confuses data (state your choice in the component comment).
- **Tables**: `text-start`; numeric columns `text-end tabular-nums`? Persian digits are monospace-ish in Vazirmatn; still use `tabular-nums` where available. Sticky first column sticks to the right (`sticky start-0`).
- **Forms**: label above input; helper and error text `text-start`; password/OTP/phone inputs LTR. OTP boxes order: first digit at the **left** for LTR code entry is acceptable, but keep the whole group `dir="ltr"` so typing and paste feel natural.
- **Scrollers**: horizontally scrollable lists start at the right edge automatically in RTL; check scroll snapping and `scrollIntoView` logic.
- **Absolute decorations** (badges at corners): use `start-*/end-*`, `-end-1`.
- **Gradients/shadows**: directional ones (`bg-gradient-to-r`, `shadow-[4px_0_…]`) mirror: use `bg-gradient-to-l` under `rtl:` or logical gradient directions (`bg-linear-to-e` does not exist; use `rtl:bg-gradient-to-l`).
- **Transforms and animation**: any `translate-x`, `slide-in-from-*`, marquee, parallax must be checked in RTL.
- **Images with text or arrows** are not mirrored; icons are (see above).

## Review checklist
Root has `lang="fa" dir="rtl"` · scan passes · digits and dates via formatters · inputs that must be LTR are · directional icons flip · overlays open on the correct side · charts/sliders/progress fill from the right · focus order follows visual order · no clipped Persian text.

## Templates
`templates/format.ts.tpl` + `format.test.ts.tpl` → copy to `lib/format.ts` and `lib/format.test.ts` (rename, drop `.tpl`). Tests are verified passing.
