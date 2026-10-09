---
description: Pre-release gate — build, tests, RTL, a11y, SEO, security and external-request checks with a go/no-go report
allowed-tools: Read, Grep, Glob, Bash, Agent
---

Run and report (no fixes unless trivial and safe):
1. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (note bundle sizes of heavy routes).
2. `npm run rtl:scan` must be clean; `grep -R "next/font/google\|fonts.googleapis\|cdn\.\|googletagmanager\|recaptcha" app components lib` must be empty (D-002).
3. Secrets: no keys in code, `.env.example` complete, `NEXT_PUBLIC_*` contains nothing sensitive.
4. Routes: every route has `loading`/`error` where data loads; `not-found` exists; `robots`/`sitemap`/metadata/JSON-LD present; `/admin`, `/account`, `/checkout` protected in `proxy.ts` and in server actions.
5. Domain: pricing, availability and state-machine tests pass; payment callback idempotent; hold expiry job exists.
6. Run `ux-rtl-auditor` on home, product, checkout pay step, account booking, admin dashboard; run `code-reviewer` on `lib/auth`, payment and booking actions.
7. Output a table: check, result (pass/fail/not run), note. End with GO or NO-GO and the shortest list of blockers. Reply in Persian.
