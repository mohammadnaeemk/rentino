# LensLoop (رنتینو) — backend

REST API for the Persian RTL rental marketplace frontend in the parent
directory. **NestJS 11 + PostgreSQL 17 + Prisma 6 + TypeScript.**

Everything lives under `/api/v1`. Money is stored as **integer Rial**
(1 Toman = 10 Rial). Rental dates are calendar days and the **return date is
exclusive** (`2026-01-01 → 2026-01-04` is a 3-day rental).

---

## 1. Prerequisites

- Node.js 20+ (developed on Node 24)
- PostgreSQL 17 — either Docker (reproducible) or Homebrew (native)

### Database — option A: Docker (recommended)

```bash
docker compose up -d          # starts postgres:17 on :5432
```

`docker/init-db.sql` creates both `rentino` (dev) and `rentino_test` (tests) on
first start.

### Database — option B: Homebrew

```bash
brew install postgresql@17
brew services start postgresql@17
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"

createuser -s rentino
psql -d postgres -c "ALTER USER rentino WITH PASSWORD 'rentino';"
createdb -O rentino rentino
createdb -O rentino rentino_test
```

---

## 2. Configuration

```bash
cp .env.example .env
```

Then edit `.env`. The defaults already point at the database above:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Dev database connection string |
| `TEST_DATABASE_URL` | **Separate** database used only by `npm run test:e2e` |
| `PORT` | HTTP port (default `8000`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing keys — replace in any real deployment (`openssl rand -hex 32`) |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Token lifetimes (`15m`, `7d`) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `FRONTEND_URL` | Where simulated payments redirect back to |
| `API_PUBLIC_URL` | Public base URL of this API (used to build the mock-gateway link) |
| `SWAGGER_ENABLED` | `false` disables `/docs` |

`.env` is gitignored. **Never commit real secrets.**

---

## 3. Install, migrate, seed, run

```bash
npm install
npx prisma migrate dev --name init   # creates the schema
npm run seed                         # Persian demo data
npm run start:dev                    # http://localhost:8000/api/v1
```

- API root: <http://localhost:8000/api/v1>
- Swagger UI: <http://localhost:8000/docs>
- Health: <http://localhost:8000/health> (unversioned, for monitors)

### Demo accounts (seeded)

All demo accounts share the password **`rentino1234`**. They exist only for
local demonstration — never reuse them anywhere real.

| Email | Role | Name |
|---|---|---|
| `admin@rentino.ir` | ADMIN | مدیر سیستم |
| `provider@rentino.ir` | PROVIDER | علی رضایی |
| `provider2@rentino.ir` | PROVIDER | سارا موسوی |
| `customer@rentino.ir` | CUSTOMER | مریم احمدی |
| `customer2@rentino.ir` | CUSTOMER | رضا کاظمی |

The seed is idempotent — running it again updates rows instead of duplicating.

---

## 4. Frontend wiring

The frontend reads `NEXT_PUBLIC_API_URL`. In the repository root:

```bash
cp .env.example .env.local     # already contains the value below
```

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

That single variable is the whole integration — no component changes. The
frontend already calls these routes, sends `credentials: "include"`, and reads
the `{ success, message, data, meta? }` envelope.

---

## 5. Auth model

- **Cookies, not headers.** The frontend's API client sends cookies
  (`credentials: "include"`) and no `Authorization` header, so login/register
  set two httpOnly cookies: `accessToken` (15m) and `refreshToken` (7d).
- Refresh tokens are stored **only as SHA-256 hashes**. Every refresh rotates
  the token and revokes the previous one; logout revokes the presented token.
- Public registration may only choose `CUSTOMER` or `PROVIDER` — **`ADMIN` is
  never self-registerable** and is created by the seed.
- `RolesGuard` + `@Roles()` enforce access; services additionally enforce
  ownership (a provider can only edit their own listings and orders).

---

## 6. What is real vs. simulated

**Real**

- PostgreSQL persistence, migrations, foreign keys, indexes and constraints
- Password hashing (bcrypt), JWT issuing/rotation, role and ownership checks
- Booking conflict prevention (serializable transaction + date-overlap check)
- Server-side price calculation — a client-supplied total is ignored
- Status state machine, list pagination, search/filter/sort, dashboards

**Simulated / out of scope**

- **Payments.** `POST /payments/create` creates a `PENDING` payment and returns
  a URL to a locally served mock gateway page labelled
  «درگاه پرداخت آزمایشی». No gateway is contacted, **no money moves, and no
  card details are stored** — `method` is always `"SIMULATED"`.
- **Google sign-in.** `POST /auth/google` returns `501`. Not configured.
- **Gemini AI search.** Out of scope for this backend.
- **Image uploads.** `images` is an array of URL strings; no file storage.
- Favourites, Redis, queues and microservices are intentionally absent.

---

## 7. Testing

```bash
npm run test        # unit tests (no database)
npm run test:e2e    # integration tests (see below)
npm run lint
npm run typecheck
npm run build
```

`npm run test:e2e` runs against **`TEST_DATABASE_URL`** (`rentino_test`) and
truncates that database before each run. It never touches your dev database.
Create it once:

```bash
createdb -O rentino rentino_test
npx prisma migrate deploy   # with DATABASE_URL pointing at rentino_test
```

---

## 8. Project layout

```
prisma/          schema.prisma, migrations/, seed.ts
src/
  common/        envelope interceptor, exception filter, guards, DTOs, utils
  auth/          register / login / refresh / logout / me, token service
  users/         profile + admin user management
  categories/    public read, admin write
  gear/          public catalog, provider CRUD, admin moderation
  rentals/       booking, availability, status machine, provider/admin views
  payments/      simulated payment flow + mock gateway page
  reviews/       one review per customer per listing
  blog/          public posts, admin CRUD + publish
  dashboard/     provider + admin statistics
  health/        liveness + database check
test/            e2e suite and its environment
```

See `../docs/` for the product/domain documentation and `../AGENTS.md` for
project-wide instructions.
