---
description: Apply or change the brand identity (colors, logo, font weight, radius) by editing tokens only
argument-hint: <brand colors / mood / "decide for me">
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Skill
---

Brand input: $ARGUMENTS

1. Load `design-system`. Read the token block of `app/globals.css` and `docs/DESIGN-SYSTEM.md` §2.
2. Choose primary, accent, neutrals and semantic colors in OKLCH for light and dark. If the owner gave hex values, convert them. If "decide for me", propose a palette fitting a premium-but-approachable camera rental brand and state the rationale in 3 lines.
3. Check contrast programmatically (WCAG: text 4.5:1, large text/UI 3:1) for foreground/background pairs in both themes; adjust lightness until all pass. Use a small Node script in `.claude/tmp/` (do not commit).
4. Edit **only** tokens (`:root`, `.dark`, `@theme inline`) and logo/favicon files. Do not touch components. Update `docs/DESIGN-SYSTEM.md` §2 to match and log `D-` decision.
5. Verify the `/dev/ui` gallery or three key pages (home, product, checkout) in both themes via screenshots. Reply in Persian, ≤4 lines, with the palette.
