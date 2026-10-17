# Rentino (رنتینو) — Phase 1 Discovery Report

**Status:** Phase 1 complete; awaiting approval to start Phase 2
**Prepared:** Saturday 2026-10-17 (25 Mehr 1405)
**Scope of this document:** evidence gathering and execution planning only. No application code, database, configuration, or existing project file was modified. No final report was generated.

---

## 1. Executive summary

- The repository is a **working two-tier application**, not a frontend-only prototype. It contains:
  - a Next.js 16 / React 19 frontend at the repository root;
  - a NestJS 11 / Prisma 6 / PostgreSQL backend under `backend/`;
  - 6 seeded categories, 13 seeded listings, 5 role-based users, 3 orders, 8 reviews, and 3 blog posts.
- The current documentation (`docs/STATUS.md`, `docs/ARCHITECTURE.md`, `docs/DOMAIN.md`) is **stale**: it still describes the backend as external/absent, Swagger as missing, and tests as absent. The code disproves those statements.
- The academic materials were located and inspected:
  - the course textbook downloaded successfully from the supplied Google Drive link;
  - the BSc template is a **23-page Persian PDF** from the University of Isfahan;
  - the sample project is a **101-page Persian report** on an Isfahan tourism chatbot.
- **A hard calendar conflict exists** if "Tuesday" means the nearest Tuesday (2026-10-20): the nearest Friday (2026-10-23) falls *after* that presentation. The schedule is only internally consistent if the presentation is Tuesday 2026-10-27. This must be confirmed before detailed scheduling.
- The product is materially complete for a university project: authentication, roles, catalog, provider CRUD, booking with overlap prevention, simulated payment, reviews, blog, dashboards, Swagger, and seed data are all present. The main **missing product capability is the AI natural-language search**, which is explicitly spec-only. The main **known functional defect** is that category deep-links (`/gear?category=…`) are ignored by the listing page.

---

## 2. Verified repository and architecture

### 2.1 Repository shape

| Area | Path | Verified content |
|---|---|---|
| Frontend | repository root (`src/`) | Next.js App Router, 34 routes, 96 tracked source files |
| Backend | `backend/` | NestJS API, 17 controllers, Prisma schema and migration, seed, unit/e2e tests |
| Product docs | `docs/` | `PROJECT.md`, `DOMAIN.md`, `ARCHITECTURE.md`, `STATUS.md`, `CONVENTIONS.md` (the last three are partially stale) |
| Archive | `_archive/` | superseded single-operator kit; not the current spec |
| Seed assets | `public/images/` | category SVGs + 5 listing photos |

Git status at start: clean. Backend and frontend are both tracked in the same repository.

### 2.2 Verified versions

| Component | Verified version | Evidence |
|---|---|---|
| Node.js | 24.15.0 | `node -v` |
| npm | 11.12.1 | `npm -v` |
| Next.js | 16.3.0 | `package.json` / lockfile |
| React | 19.2.8 | `package.json` / lockfile |
| TypeScript | 5.9.3 | lockfile |
| Tailwind CSS | 4.3.3 | lockfile |
| NestJS | 11.2.7 | backend lockfile |
| Prisma Client / CLI | 6.19.3 | backend lockfile |
| Jest | 29.7.0 | backend lockfile |
| Local PostgreSQL | 18.6 (Homebrew) | `psql --version` |
| Repo-declared PostgreSQL | 17 (`postgres:17-alpine`) | `backend/docker-compose.yml`, `backend/README.md` |

**Discrepancy to disclose in the report:** the local machine runs PostgreSQL 18.6, while the reproducible Docker setup pins 17. The schema is compatible, but the final report must state both facts rather than claim a single version.

### 2.3 Frontend surface

Route groups and pages verified under `src/app/`:

- Public: `/`, `/gear`, `/gear/[slug]`, `/blog`, `/blog/[slug]`, `/about`, `/contact`, `/help`, `/how-it-works`, `/privacy`, `/terms`
- Auth: `/login`, `/register`
- Customer dashboard: `/dashboard/customer`, `/orders`, `/orders/[id]/pay`, `/payments`, `/profile`
- Provider dashboard: `/dashboard/provider`, `/gear`, `/gear/new`, `/gear/[id]/edit`, `/orders`, `/profile`
- Admin dashboard: `/dashboard/admin`, `/blog`, `/blog/new`, `/blog/[id]/edit`, `/categories`, `/gear`, `/rentals`, `/users`, `/profile`
- Payment outcomes: `/payment/success`, `/payment/cancel`

The frontend uses a single typed client (`src/lib/api.ts`) with 42 call sites, cookie credentials, and refresh-on-401 handling. Server Components fetch public pages directly; Client Components use the wrapper.

**Important behaviour:** several public pages fall back to bundled mock data (`src/lib/content.ts`) when the backend is unreachable. This can hide integration failures during a demo, so browser verification must be done with the backend running.

### 2.4 Backend surface

Modules and route families verified under `backend/src/`:

| Module | Main routes |
|---|---|
| `auth` | `POST /auth/register`, `/login`, `/refresh`, `/logout`; `GET /auth/me`; `POST /auth/google` → **501** |
| `users` | `PUT /users/me`; admin `GET /admin/users`, `PATCH /admin/users/:id` |
| `categories` | public `GET /categories`; admin `POST/PUT/DELETE /categories` |
| `gear` | public `GET /gear`, `GET /gear/:id`; provider `GET/POST/PUT/DELETE /provider/gear`; admin `GET /admin/gear`, `PATCH /admin/gear/:id` |
| `rentals` | customer `POST/GET /rentals`, `GET /rentals/:id`, `PATCH /rentals/:id/cancel`; provider `GET /provider/orders`, `PATCH /provider/orders/:id`; admin `GET /admin/rentals` |
| `payments` | `POST /payments/create`, `GET /payments`, `GET /payments/simulate/:id`, `POST /payments/:id/complete`, `POST /payments/:id/cancel` |
| `reviews` | `POST /reviews`, `GET /reviews` |
| `blog` | public `GET /blog`, `GET /blog/:slug`; admin CRUD + publish/unpublish |
| `dashboard` | `GET /provider/dashboard`, `GET /admin/dashboard` |
| `health` | `GET /health` (unversioned) |

Global behaviour:
- all API routes under `/api/v1` (health excluded);
- Swagger UI at `/docs` (runtime-generated; no committed `openapi.json`);
- validation via `class-validator` + global `ValidationPipe` (whitelist, transform);
- response envelope `{ success, message, data, meta? }` and a global exception filter;
- authentication via **httpOnly cookies** (`accessToken` 15m, `refreshToken` 7d), not Authorization headers;
- refresh tokens stored as SHA-256 hashes and rotated on refresh;
- `RolesGuard` + `@Roles()` for role checks; services additionally enforce ownership;
- admin accounts are seed-only and cannot be self-registered.

### 2.5 Database schema (Prisma)

Models verified in `backend/prisma/schema.prisma`:

`User`, `RefreshToken`, `Category`, `GearItem`, `RentalOrder`, `RentalOrderItem`, `Payment`, `Review`, `BlogPost`.

Key constraints:
- money is integer **Rial** (1 Toman = 10 Rial);
- rental dates are `@db.Date` and `endDate` is **exclusive**;
- `GearItem.specifications` is JSON for data-driven category attributes;
- `GearItem.stock` / `availableStock` support quantity-aware booking;
- `RefreshToken.tokenHash` is unique;
- one payment per order (`rentalOrderId @unique`);
- one review per customer per listing (`@@unique([gearItemId, customerId])`).

The development database currently has 10 public tables (9 models + Prisma migrations table). The `rentino_test` database exists but is **empty**.

### 2.6 Booking and lifecycle logic

- Booking runs inside a serializable transaction.
- Overlapping bookings are detected against blocking statuses: `PLACED`, `CONFIRMED`, `PAID`, `PICKED_UP`.
- Stock is respected: an overlapping booking is allowed only if remaining stock suffices.
- The server computes the total from dates × price × quantity; a client-supplied total is ignored.
- Status machine (from `backend/src/rentals/rental-status.ts`):
  `PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED`, with `CANCELLED` branches.
- Unit tests for the state machine pass.

### 2.7 Payments

- **Simulated only.** `Payment.method` defaults to `"SIMULATED"`.
- `POST /payments/create` returns a locally served mock-gateway URL labelled «درگاه پرداخت آزمایشی».
- `complete` / `cancel` redirect to frontend success/cancel pages.
- No real gateway is contacted, no money moves, no card data is stored.
- This corrects the stale `docs/DOMAIN.md` claim of `STRIPE | SSLCOMMERZ`.

### 2.8 Seed data

`backend/prisma/seed.ts` is idempotent and seeds:

| Entity | Count |
|---|---|
| Users | 5 (1 admin, 2 providers, 2 customers) |
| Categories | 6: cars, consoles, bikes, cameras, laptops, sports |
| Listings | 13 |
| Orders | 3 |
| Reviews | 8 |
| Blog posts | 3 |

Demo password is documented in `backend/README.md`; it must not be presented as production security.

### 2.9 Build and test evidence (run in this session)

| Check | Command | Result |
|---|---|---|
| Backend unit tests | `cd backend && npm test -- --runInBand` | **PASS** — 4 suites, 20 tests, 0 failures |
| Backend typecheck | `cd backend && npx tsc --noEmit` | **PASS** (exit 0) |
| Backend lint | `cd backend && npm run lint` | **PASS** (exit 0) |
| Backend build | `cd backend && npm run build` | **PASS** (exit 0) |
| Backend e2e | `cd backend && npm run test:e2e` | **FAIL** — 1 suite / 26 tests failed before execution: `public.Payment` does not exist in `rentino_test` |
| Frontend typecheck | `npx tsc --noEmit` | **PASS** (exit 0) |
| Frontend lint | `npm run lint` | **PASS** (exit 0, 9 warnings, 0 errors) |
| Frontend build | `npm run build` | **PASS** (exit 0, 34 routes) |

**E2E diagnosis:** the suite is correctly written (26 meaningful tests covering auth, RBAC, catalog, booking conflicts, pricing, status transitions, reviews, dashboards). It fails only because the test database has not been migrated. Running `prisma migrate deploy` against `TEST_DATABASE_URL` would fix it, but that changes database state and therefore requires explicit approval. Until then, the final report must say "e2e suite present but not executed successfully," not "e2e passed."

---

## 3. Feature inventory

Legend: **Implemented** = present in code and supported by build/unit evidence; **Needs runtime verification** = code present but not yet exercised end-to-end in this session; **Not implemented** = absent or explicitly stubbed; **Future** = outside current scope.

### 3.1 Implemented and verified

| # | Capability | Evidence |
|---|---|---|
| F-01 | Persian RTL shell (`lang="fa" dir="rtl"`), self-hosted Vazirmatn, Persian digits, Jalali formatting | `src/app/layout.tsx`, `src/lib/format.ts` |
| F-02 | Public home page with featured listings/categories/blog/testimonials | `src/app/page.tsx` |
| F-03 | Catalog list with client-side search, category/price filters, sort, pagination | `src/app/gear/page.tsx` |
| F-04 | Listing detail with reviews and related listings | `src/app/gear/[slug]/page.tsx` |
| F-05 | Blog list/detail with API + bundled fallback | `src/app/blog/**`, `src/lib/content.ts` |
| F-06 | Static pages: about, contact, help, how-it-works, privacy, terms | `src/app/**` |
| F-07 | Email/password registration and login | `backend/src/auth/**` |
| F-08 | Cookie-based JWT access/refresh with rotation and hashed refresh tokens | `token.service.ts`, `auth.service.ts` |
| F-09 | Roles `CUSTOMER / PROVIDER / ADMIN` with guards and ownership checks | `common/guards`, `@Roles()` |
| F-10 | Profile update; admin user role/status management | `users/**` |
| F-11 | Provider listing CRUD | `provider-gear.controller.ts` |
| F-12 | Admin listing moderation | `admin-gear.controller.ts` |
| F-13 | Category public read + admin CRUD | `categories/**` |
| F-14 | Booking creation with date validation, overlap/stock check, server-side pricing | `rentals.service.ts`, `availability.ts` |
| F-15 | Customer order list/detail/cancel | `rentals.controller.ts` |
| F-16 | Provider order list + status transitions | `provider-orders.controller.ts` |
| F-17 | Admin rental list | `admin-rentals.controller.ts` |
| F-18 | Simulated payment create/list/gateway/complete/cancel | `payments/**` |
| F-19 | Reviews with rental-history requirement and one-per-customer constraint | `reviews/**` |
| F-20 | Admin blog CRUD + publish/unpublish | `blog/**` |
| F-21 | Provider and admin dashboard statistics | `dashboard/**` |
| F-22 | Health endpoint with DB connectivity | `health/**` |
| F-23 | Swagger/OpenAPI runtime documentation | `backend/src/main.ts` |
| F-24 | Idempotent Persian seed data | `backend/prisma/seed.ts` |
| F-25 | Input validation, consistent response envelope, global exception filter | `common/**`, `main.ts` |

### 3.2 Implemented but needs runtime/manual verification

| # | Capability | Why it needs verification |
|---|---|---|
| V-01 | Full customer booking → payment → order history journey | E2E blocked by unmigrated test DB; needs a live browser run |
| V-02 | Provider confirm → pick up → return journey | Same |
| V-03 | Admin category/user/listing/blog management screens | Code present; not browser-tested in this session |
| V-04 | Review submission and display | Code present; e2e blocked |
| V-05 | Role-based dashboard redirects | Code present in `src/app/dashboard/layout.tsx`; not browser-tested |
| V-06 | Google sign-in UI | Backend intentionally returns `501`; button is conditional on `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| V-07 | Demo login buttons | Frontend-only in-memory users; not a backend authentication path |

### 3.3 Known defects / incomplete behaviour

| # | Issue | Evidence | Impact |
|---|---|---|---|
| D-01 | Category deep-links are ignored | Home tiles link to `/gear?category=<slug>` (`src/app/page.tsx:389`), but `src/app/gear/page.tsx` initializes `category` to `"all"` and never reads the URL | A user clicking a category tile sees the unfiltered catalog. This is the only confirmed functional defect. |
| D-02 | `docs/STATUS.md`, `ARCHITECTURE.md`, `DOMAIN.md` are stale | They say backend external, no Swagger, no tests, STRIPE/SSLCOMMERZ | Report must not repeat these claims; docs need correction or an explicit "historical" note |
| D-03 | E2E test database not migrated | `rentino_test` has no tables; 26 tests fail at setup | Cannot claim e2e pass |
| D-04 | No frontend test runner | No Vitest/Jest in root `package.json` | No automated frontend coverage; browser testing is the only evidence |
| D-05 | Role middleware disabled | `src/middleware.ts.desabled` | Route protection is client-side in the dashboard layout, not edge middleware |
| D-06 | No committed OpenAPI file | Swagger is generated at runtime | The report can cite `/docs` but not a static spec file |
| D-07 | No real image upload | `GearItem.images` is a URL array | Provider must paste image URLs |
| D-08 | Naming inconsistency | Root package `lensloop`; backend `lensloop-backend`; product is Rentino | Terminology register must standardise on **Rentino / رنتینو** and note "LensLoop" as the codebase codename |
| D-09 | Local PostgreSQL 18 vs repo 17 | `psql --version` vs `docker-compose.yml` | Report must disclose both |

### 3.4 Not implemented / explicitly out of scope

| # | Capability | Status |
|---|---|---|
| N-01 | AI natural-language search (Gemini) | **Spec only** — `docs/PROJECT.md`; no route, no client code, no key usage |
| N-02 | Real payment gateway | Simulated only |
| N-03 | Google OAuth | Backend `501` |
| N-04 | Deposits, escrow, refunds, insurance | Absent |
| N-05 | KYC / identity verification | Absent |
| N-06 | Delivery / pickup logistics | Absent |
| N-07 | Dispute resolution / support tickets | Absent |
| N-08 | Favorites / wishlists | Absent |
| N-09 | Notifications / chat | Absent |
| N-10 | Production deployment / CI/CD | Absent; local development only |
| N-11 | Mobile app | Absent |
| N-12 | House/apartment rentals | Mentioned in `docs/PROJECT.md` but not implemented as a category |

**Rule for the final report:** N-01 is a future enhancement. It must not appear in the implemented-features chapter, screenshots, or claim list unless the team explicitly approves implementing it before the presentation.

---

## 4. Input-file inspection status

### 4.1 Course textbook — accessed successfully

| Item | Detail |
|---|---|
| Source | Supplied Google Drive link |
| File | `PressmanBook-9ed.pdf` |
| Title | *Software Engineering: A Practitioner's Approach*, 9th edition |
| Authors | Roger S. Pressman, Bruce R. Maxim |
| Publisher / year | McGraw-Hill Education, © 2020 |
| ISBN | 978-1-260-54800-6 |
| Pages | 705 |
| Local working copy | `/tmp/rentino-pressman.pdf` (moved outside the repository; not committed) |

Relevant chapters for the report:
- Ch. 1 — software and software engineering
- Ch. 2–4 — process models, agility/Scrum, recommended process
- Ch. 6–8 — principles, understanding requirements, requirements modelling
- Ch. 9–12 — design concepts, architectural design, component design, UX design
- Ch. 16–17 — reviews and software quality assurance
- Ch. 19–20 — component and integration testing
- Ch. 22–23 — configuration management, metrics
- Ch. 24–26 — project management, viable planning, risk management
- Appendix 1 — UML

**Limitation:** the textbook is a practitioner text, not a research-methods text. It supports process/requirements/design/quality/PM claims, not market-size claims. Market claims must cite separate credible sources.

### 4.2 BScProjectTemplate — PDF only

| Item | Detail |
|---|---|
| Path | `/Users/naeem/Downloads/BScProjectTemplate.pdf` |
| Pages | 23 |
| Institution | University of Isfahan, Faculty of Computer Engineering |
| Document type | BSc thesis/project template (Persian) |
| Page size | A4 (595.3 × 842 pt) |
| Text block | x ≈ 70.9–524 pt (≈ 2.5 cm side margins); y ≈ 85–711.5 pt (≈ 3 cm top, ≈ 4.6 cm bottom including footer) |
| Body font | **B Nazanin 13** for Persian, **Times New Roman 11** for English |
| Heading sizes stated in template | Level 2: B Nazanin Bold 16; level 3: Bold 14; level 4: Bold 12; English equivalents Times New Roman Bold 11/12/14 |
| Captions | B Nazanin Bold 12 / Times New Roman Bold 11; figure caption below, table caption above; chapter-based numbering (e.g. 2-1) |
| Front matter | Title page, approval page, acknowledgment, dedication, abstract (≥200 words, ≤1 page), TOC, list of figures, list of tables, abbreviations |
| Chapters | 1 Introduction; 2 Concepts; 3 Project description; 4 Results; 5 Conclusions & recommendations; References; Appendix |
| Citation style | Numbered bracketed references `[1]`, `[2]` (IEEE-like) |

**Adaptation decisions for a Software Engineering project report:**
- Keep page setup, heading hierarchy, captions, numbering, TOC/lists, and reference style.
- Omit or adapt thesis-only front matter (approval/jury page, dedication, "BSc thesis" labels, supervisor signature block).
- Replace "Concepts" and "Results" with the assignment-required structure (literature review; analysis and evaluation).
- Use automatic TOC and caption fields; do not type fake page numbers.
- Use B Nazanin if available (it is installed locally: `B-NAZANIN.TTF`, `IRNazanin.ttf`); otherwise the document must request it and disclose the substitution.

**Missing input:** no `.docx` version of the template was found. The PDF is sufficient as a formatting specification, but a native `.docx` would preserve styles more exactly. This requires confirmation.

### 4.3 Sample university project — inspected

| Item | Detail |
|---|---|
| Path | `/Users/naeem/Downloads/نمونه پروژه.pdf` |
| Pages | 101 |
| Author metadata | `ali sadeghi`; created 2026-01-30 with Microsoft Word 2019 |
| Title | *چت‌بات هوشمند گردشگری اصفهان* (Isfahan smart tourism chatbot) |
| Institution | University of Isfahan / Shahreza Higher Education Center |
| Structure | 5 chapters: (1) phase 1 — topic, goals, market, competitors, needs, requirements, Scrum methodology, technologies; (2) phase 2 — UML (use case, sequence, class, database, DFD); (3) phase 3 — final product, usability, productivity, accuracy, maintainability, reusability, testability, project planning; (4) conclusions and recommendations; (5) appendices — references, GitHub, RACI, user guide |
| Useful conventions | Chapter-based tables, Persian academic prose, market/competitor analysis, quality attributes, RACI and MSP appendices |
| Weaknesses to avoid | Market statistics are largely unsourced; RACI and MSP are embedded as images (not editable); citation style is inconsistent; some claims are not traceable to evidence; "RCIA" is a typo for RACI |

**Use:** structural and quality reference only. Do not copy content, assumptions, or unsourced statistics.

### 4.4 Missing / unconfirmed inputs

- No `.docx` BSc template.
- No instructor rubric, page limit, or explicit citation-style requirement beyond the template's `[n]` examples.
- No team skills/availability matrix.
- No confirmed Trello workspace or board.
- No confirmed presentation date (see §5).

---

## 5. Calendar and schedule analysis

**Today:** Saturday 2026-10-17 = **25 Mehr 1405**.

| Gregorian | Persian | Weekday |
|---|---|---|
| 2026-10-17 | 25 Mehr 1405 | Saturday |
| 2026-10-18 | 26 Mehr 1405 | Sunday |
| 2026-10-19 | 27 Mehr 1405 | Monday |
| 2026-10-20 | 28 Mehr 1405 | **Tuesday** |
| 2026-10-21 | 29 Mehr 1405 | Wednesday |
| 2026-10-22 | 30 Mehr 1405 | Thursday |
| 2026-10-23 | 1 Aban 1405 | **Friday** |
| 2026-10-24 | 2 Aban 1405 | Saturday |
| 2026-10-25 | 3 Aban 1405 | Sunday |
| 2026-10-26 | 4 Aban 1405 | Monday |
| 2026-10-27 | 5 Aban 1405 | **Tuesday** |

### 5.1 The conflict

The brief says: work starts Saturday night; the preferred review-ready target is Friday night; the presentation is Tuesday.

- If **Tuesday = 2026-10-20**, then "Friday night" (2026-10-23) is **three days after** the presentation. A review-ready package cannot be finalised on Friday and used on Tuesday. The stated plan is impossible as written.
- If **Tuesday = 2026-10-27**, then Friday 2026-10-23 is a genuine review-ready milestone five days before the presentation. The plan is coherent.

### 5.2 Recovery schedule if the presentation is Tuesday 2026-10-20

A full 80–110-page report with human review cannot be produced credibly in 2.5 days. Recommended recovery:

| Date | Deliverable |
|---|---|
| Sat 17 Oct (tonight) | Approve scope; freeze requirements; assign workstreams; start research and evidence pack |
| Sun 18 Oct | Core chapters (1–3) + requirements + architecture diagrams; PM artifacts v1 |
| Mon 19 Oct | Assemble **presentation package**: 15–20 slides + executive summary + key chapters; QA; rehearse; review-ready by Monday night |
| Tue 20 Oct | Present |
| Wed 21–Thu 22 Oct | Complete chapters 4–5, appendices, references, full DOCX |
| Fri 23 Oct | Full report review-ready; final corrections |
| Sat 24–Mon 26 Oct | Buffer, instructor review, final submission preparation |

The Monday-night package is a **presentation package**, explicitly labelled as such; it must not be presented as the complete final report.

### 5.3 Full schedule if the presentation is Tuesday 2026-10-27

| Date | Milestone |
|---|---|
| Sat 17 Oct | Phase 1 approval; scope freeze; workstreams and Trello board |
| Sun 18–Mon 19 Oct | Research, reference register, requirements, diagrams, PM artifacts |
| Tue 20–Wed 21 Oct | Draft chapters 1–3 and chapter 4 |
| Thu 22 Oct | Draft chapter 5; assemble DOCX; TOC/captions; internal review v1 |
| Fri 23 Oct | **Review-ready package by 23:59** |
| Sat 24–Sun 25 Oct | Corrections from review; presentation deck |
| Mon 26 Oct | QA pass; rehearsal; final buffer |
| Tue 27 Oct | Presentation and submission |

---

## 6. Proposed project scope

### 6.1 In scope for the report (implemented product)

- Persian RTL marketplace for portable goods: cars, consoles, bikes, cameras, laptops, sports equipment.
- Customer journey: browse → filter/search → detail → book dates → simulated payment → order history → review.
- Provider journey: register → create/manage listings → receive orders → confirm/hand over/return.
- Admin journey: users, categories, listings, rentals, blog, dashboard.
- REST API, PostgreSQL persistence, Prisma schema, seed data, Swagger, unit tests.
- Architecture, database, requirements, competitor analysis, risks, PM artifacts.

### 6.2 Out of scope / future (must be labelled)

- AI natural-language search (Gemini) — future enhancement.
- Real payment gateway, deposits, escrow, refunds.
- Google OAuth (backend `501`).
- KYC/identity verification, insurance, delivery, disputes.
- Image uploads, notifications, chat, favorites.
- Production deployment, CI/CD, mobile app.
- House/apartment rentals.

### 6.3 Known limitations to disclose

- Category deep-link defect.
- E2E suite not executable until the test DB is migrated.
- No frontend automated tests.
- Docs partially stale.
- Role middleware disabled; client-side guard only.
- No committed OpenAPI artifact.

---

## 7. Proposed report outline (Persian, adapted to the required structure)

| Part | Persian title | Approx. pages | Notes |
|---|---|---|---|
| Front matter | صفحه عنوان، چکیده، فهرست مطالب، فهرست شکل‌ها، فهرست جدول‌ها، فهرست اختصارات | 10–12 | automatic fields |
| 1 | فصل اول: مقدمه | 6–8 | background, problem, motivation, scope, objectives, stakeholders, report organisation |
| 2 | فصل دوم: مرور ادبیات و پیشینه | 10–12 | Pressman concepts tied to Rentino; rental marketplace concepts; requirements engineering |
| 3 | فصل سوم: شرح پروژه | 14–18 | product overview, actors, business context, use cases/journeys, boundaries, assumptions, implemented vs planned, architecture diagrams |
| 4 | فصل چهارم: تحلیل و ارزیابی | 30–40 | market research, competitors, needs, FR/NFR, tech stack, architecture/DB analysis, opportunities/challenges, risk, PM approach |
| 5 | فصل پنجم: نتیجه‌گیری و پیشنهادها | 6–8 | objective achievement, strengths, limitations, remaining work, future work |
| — | منابع | 3–5 | numbered IEEE-like references |
| — | پیوست‌ها | 15–25 | detailed FR table, use-case descriptions, RACI, WBS, schedule, Trello register, diagrams |
| — | واژه‌نامه | 2–3 | Persian/English terms and abbreviations |

The main body should stay readable; operational task detail belongs in appendices.

---

## 8. Proposed execution plan

### 8.1 Work packages (high level)

| WP | Work package | Owner (proposed) | Key deliverable | Acceptance criterion |
|---|---|---|---|---|
| WP-01 | Scope, evidence baseline, source-of-truth register | محمد نعیم کریم‌زاده | discovery report + verified feature matrix | every claim traceable to code or a cited source |
| WP-02 | Market and competitor research | معین نوری | Ch. 4.1–4.3 + reference register | each claim has a real, accessible source; assumptions labelled |
| WP-03 | Requirements engineering and use cases | محمد سجاد حسین جعفرپور | FR/NFR table, use-case descriptions, traceability | each FR has ID, actor, acceptance criteria, status, evidence |
| WP-04 | Architecture, database, tech stack, diagrams | امیرحسین ترک | Ch. 3.7, 4.6–4.7 + diagrams | diagrams match the actual schema/routes |
| WP-05 | PM artifacts: WBS, MSP schedule, RACI, Trello, risk | امیررضا | appendices C–E + risk register | every WBS item has owner, dependency, acceptance criterion; RACI has one A per row |
| WP-06 | Report drafting and integration | all; leader integrates | chapters 1–5 | consistent IDs, dates, terminology across chapters |
| WP-07 | Word production, RTL formatting, TOC/captions | ارشیا احمدی | `.docx` master + PDF preview | opens in Word; TOC/captions update; Persian RTL correct |
| WP-08 | Cross-review and QA | pairs + leader | QA report | technical, academic, PM, document checks signed off |
| WP-09 | Presentation deck and rehearsal | leader + ارشیا | 15–20 slides + rehearsal notes | fits the time slot; every claim defensible |
| WP-10 | Final package and submission | leader | all deliverables + README | file list verified; no conflicting copies |

### 8.2 Proposed team allocation and workload

Assumption: the 10-day plan (presentation 2026-10-27). Hours are estimates for coordination and review, not exact effort.

| Member | Primary responsibility | Review responsibility | Est. hours |
|---|---|---|---|
| محمد نعیم کریم‌زاده (Leader) | coordination, scope control, Ch. 1 & 5, integration, final approval | all chapters, final QA | 16–20 |
| معین نوری | market/competitor research, Ch. 4.1–4.3, reference register | Ch. 3 factual claims | 12–15 |
| محمد سجاد حسین جعفرپور | requirements (FR/NFR), use cases, traceability | Ch. 2/4 consistency | 12–15 |
| امیرحسین ترک | architecture, DB, tech stack, diagrams | requirements feasibility | 12–15 |
| امیررضا | WBS, MSP schedule, RACI, Trello, risk, PM section | Ch. 5 recommendations | 12–15 |
| ارشیا احمدی | DOCX production/formatting, figures/tables, QA, slides | references/terminology | 14–18 |

**Bottlenecks:** (1) credible market evidence; (2) DOCX/RTL formatting and field updates; (3) leader integration and human review time. Mitigation: freeze scope early, produce the Word skeleton on day 1, use cross-review pairs, reserve Friday night and Monday as buffers.

**Requires confirmation:** skills/interests, availability windows, who can operate Word professionally, who presents, and whether the proposed allocation is acceptable. No assignment is based on assumed skill.

### 8.3 Review and approval gates

1. **Gate A (this document):** approve scope, outline, dates, and allocation.
2. **Gate B (after Phase 2):** approve WBS, schedule, RACI, and Trello register.
3. **Gate C (research/requirements):** leader + cross-reviewer confirm evidence and traceability.
4. **Gate D (draft):** full read-through; fix contradictions before formatting.
5. **Gate E (review-ready):** document QA + rehearsal; freeze.
6. **Gate F (submission):** final file verification.

---

## 9. Initial risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Presentation date ambiguity / impossible Friday target | High | High | Confirm date; use recovery plan if 2026-10-20 |
| R-02 | Weak or inaccessible market evidence | High | Medium | Prefer official/industry sources; label assumptions; qualitative assessment where data is unavailable |
| R-03 | Stale repo docs cause false claims | High | High | Code is source of truth; cite file paths and verified commands |
| R-04 | E2E suite cannot run (empty test DB) | High | Medium | Disclose; migrate `rentino_test` only with approval; never claim a pass |
| R-05 | No frontend automated tests | Medium | Medium | Disclose; use browser-based verification with backend running |
| R-06 | Category deep-link defect | High | Low–Medium | Document as known limitation; fix only with approval |
| R-07 | DOCX RTL/font/TOC errors | Medium | High | B Nazanin installed; build with python-docx; update fields in Word; visual QA via PDF export |
| R-08 | Team availability / unclear roles | Medium | High | Confirm allocation and hours; cross-training; buffer |
| R-09 | Scope creep (AI search, real payments) | Medium | High | Explicit in/out scope; future-work section |
| R-10 | Fabricated or unverifiable citations | Low–Medium | High | Central reference register; verify every URL/author/date; human review |
| R-11 | Secret leakage into report | Low | High | Never print `.env` values; use variable names only |
| R-12 | Demo fallback masks backend failure | Medium | Medium | Run browser tests with the backend up; disable fallback for the demo if needed |
| R-13 | PostgreSQL 17 vs 18 mismatch | Low | Low | State both; test migrations on the declared target |
| R-14 | No deployment/CI | Medium | Medium | Describe as local prototype; put deployment in future work |
| R-15 | Insufficient human review time | High | High | Enforce gates; freeze dates; protect the Friday and Monday buffers |

---

## 10. Important unknowns requiring confirmation

1. **Presentation date:** Tuesday 2026-10-20 or Tuesday 2026-10-27?
2. **BSc template format:** is a `.docx` available, or should the PDF be used as the formatting specification?
3. **Course requirements:** citation style, page limit, required chapter structure, and whether the instructor expects the sample's phase structure or the template's chapter structure.
4. **Implementation scope:** documentation only, or approved fixes for the category deep-link and the test-database migration? AI search must remain future work unless explicitly approved.
5. **Team skills/availability:** who can do research, diagrams, Word formatting, and presentation; confirm the proposed allocation.
6. **Trello:** existing board/workspace, preferred labels, and export format.
7. **Deliverable language:** confirm that the main report and all planning artifacts should be Persian (with English technical terms where useful).
8. **Source code appendix:** should the report include a GitHub link, demo credentials, and selected code snippets?
9. **Market sources:** are Iranian competitor sites accessible from the execution environment? If not, the team must supply screenshots/notes.
10. **Deployment/demo:** is a live demo expected on presentation day, or are screenshots sufficient?

---

## 11. Approval request

Phase 1 is complete. No final report has been generated and no application/database/config file has been changed.

**To proceed, please confirm:**
- the presentation date (§10.1);
- the template format (§10.2);
- the documentation-only scope or approved fixes (§10.4);
- the proposed outline, work packages, and team allocation (§7–§8).

After approval, Phase 2 will produce the detailed WBS, MSP-style schedule (CSV + importable format), RACI matrix (XLSX), Trello task register (CSV), and workload confirmation. Phase 3 research and Phase 4 document generation will follow only after the Phase 2 gate.
