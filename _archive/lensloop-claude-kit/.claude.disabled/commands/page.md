---
description: Build or redesign one page/route with the design system, RTL, all states and visual verification
argument-hint: <route, e.g. /product/[slug]> [notes]
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Agent, Skill
---

Target: $ARGUMENTS

1. Load `ux-flows` (find the screen in `docs/UX-FLOWS.md`), `design-system`, `rtl-persian-ui`, `nextjs-conventions`. Load `rental-domain` if prices or dates appear.
2. Define the page's job, primary action, data, and all states in 5 lines.
3. Build: Server Component page → `generateMetadata` → data via repository → small client islands → `loading.tsx`, `error.tsx`, empty state → Persian copy via glossary.
4. Design with intent (see `frontend-design`): strong hierarchy, real content, one accent, no template look. Mobile first at 390px, then `md:` and `lg:`.
5. Verify: lint, typecheck, `rtl:scan`, then screenshots at 390px and 1280px in both themes (see `testing-verification`) and Read them. Run `ux-rtl-auditor` on the route; fix BLOCKER and SHOULD items.
6. Commit. Reply in Persian, ≤4 lines, including what was not verified.
