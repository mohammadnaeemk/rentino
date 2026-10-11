# Project invariants (always apply)

- Persian RTL is live (`dir="rtl" lang="fa"`, logical Tailwind utilities,
  self-hosted Vazirmatn). Never reintroduce physical `ml/mr/pl/pr/left/right`
  utilities — the edit hook blocks them.
- Never expose `GEMINI_API_KEY` or backend secrets to the client (server-only).
- Category-specific behavior stays data-driven (`Category` + `specifications`
  JSON on `Gear`), not per-category code branching.
- Roles are `CUSTOMER | PROVIDER | ADMIN`; dashboards are role-guarded.
- Backend base URL is `NEXT_PUBLIC_API_URL` — no second env var name.
- `_archive/lensloop-claude-kit/` is superseded (single-operator model) — do
  not treat it as the current spec.
