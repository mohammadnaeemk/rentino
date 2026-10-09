---
name: rtl-persian-ui
description: Use whenever building or editing UI text/layout for this Persian (Farsi) RTL marketplace — covers direction, fonts, number formatting, and shadcn/Radix RTL quirks.
---

## Direction
Set `dir="rtl"` and `lang="fa"` on `<html>` in `src/app/layout.tsx`. Prefer
Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`,
`text-end`) over physical ones (`ml-*`, `mr-*`, `text-left`) in new/edited
markup so layout flips correctly under RTL.

## Font
Use a Persian-capable font (e.g. Vazirmatn) loaded via `next/font/local` or
Google Fonts subset alongside the existing font in `layout.tsx`; don't rely on
system fonts only, Latin fonts render Persian glyphs poorly.

## Numbers & currency
Persian users expect Persian prices in Toman/Rial. Format with
`Intl.NumberFormat("fa-IR")` for digits where appropriate, but confirm with
existing `pricePerDay` display components before changing globally — don't
silently switch all numerals to Persian digits if the design uses Latin
digits for prices (check current `gear-card.tsx` / `rent-now-card.tsx`).

## Component quirks
- Radix `Select`/`DropdownMenu`/`Popover` don't auto-flip side based on `dir`;
  test visually, pass explicit `side`/`align` if content clips off-screen.
- Icons implying direction (arrows, chevrons for "next/back") must be mirrored
  in RTL — use `rtl:rotate-180` utility rather than swapping icon components.
- Keep English-only content (code, prices in digits, brand names) as `dir="ltr"`
  inline spans inside RTL containers to avoid bidi scrambling.
