/**
 * End-to-end suite for the LensLoop API.
 *
 * Runs against a dedicated `rentino_test` database (see `test/setup-env.ts`)
 * with the real Prisma schema migrated in. Every table is truncated in
 * `beforeAll`, so this NEVER touches the developer's dev database.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { API_PREFIX } from "../src/common/constants";
import { validationExceptionFactory } from "../src/common/pipes/validation-exception.factory";
import { PrismaService } from "../src/prisma/prisma.service";

const PROVIDER = {
  name: "تأمین‌کننده تست",
  email: "provider-e2e@rentino.ir",
  password: "Password1",
  role: Role.PROVIDER,
};

const CUSTOMER = {
  name: "مشتری تست",
  email: "customer-e2e@rentino.ir",
  password: "Password1",
  role: Role.CUSTOMER,
};

function isoDay(offset: number): string {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + offset,
    ),
  )
    .toISOString()
    .slice(0, 10);
}

describe("LensLoop API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let categoryId: string;

  /** Cookie-persisting clients, one per seeded identity. */
  let provider: ReturnType<typeof request.agent>;
  let customer: ReturnType<typeof request.agent>;

  let gearId: string;
  let gearSlug: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // Mirror `main.ts` so the suite exercises the real request pipeline.
    app.setGlobalPrefix(API_PREFIX, { exclude: ["health"] });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        exceptionFactory: validationExceptionFactory,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // --- truncate the test database (FK-safe order) -------------------------
    await prisma.payment.deleteMany();
    await prisma.rentalOrderItem.deleteMany();
    await prisma.rentalOrder.deleteMany();
    await prisma.review.deleteMany();
    await prisma.gearItem.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();

    const category = await prisma.category.create({
      data: { name: "دوربین", slug: "cameras", icon: "cameras" },
    });
    categoryId = category.id;

    await prisma.user.create({
      data: {
        name: "مدیر تست",
        email: "admin-e2e@rentino.ir",
        passwordHash: await bcrypt.hash("Password1", 10),
        role: Role.ADMIN,
      },
    });

    provider = request.agent(app.getHttpServer());
    customer = request.agent(app.getHttpServer());

    await provider
      .post(`/${API_PREFIX}/auth/register`)
      .send(PROVIDER)
      .expect(201);
    await customer
      .post(`/${API_PREFIX}/auth/register`)
      .send(CUSTOMER)
      .expect(201);
  }, 60_000);

  afterAll(async () => {
    await app.close();
  });

  // -------------------------------------------------------------------------
  // Health
  // -------------------------------------------------------------------------

  it("reports health with database connectivity", async () => {
    const res = await request(app.getHttpServer()).get("/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database).toBe("up");
  });

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  it("rejects public registration as ADMIN", async () => {
    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/register`)
      .send({ ...CUSTOMER, email: "sneaky@rentino.ir", role: Role.ADMIN })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a weak password with field-level errors", async () => {
    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/register`)
      .send({ ...CUSTOMER, email: "weak@rentino.ir", password: "abc" })
      .expect(400);
    expect(res.body.errors).toBeDefined();
    expect(Object.keys(res.body.errors)).toContain("password");
  });

  it("refuses a duplicate email", async () => {
    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/register`)
      .send(PROVIDER)
      .expect(409);
  });

  it("rejects a wrong password without revealing which field was wrong", async () => {
    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/login`)
      .send({ email: CUSTOMER.email, password: "WrongPass1" })
      .expect(401);
  });

  it("requires authentication for /auth/me", async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/auth/me`)
      .expect(401);
  });

  it("returns the profile for a cookie-authenticated caller", async () => {
    const res = await customer.get(`/${API_PREFIX}/auth/me`).expect(200);
    expect(res.body.data.email).toBe(CUSTOMER.email);
    expect(res.body.data.role).toBe(Role.CUSTOMER);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("rotates the refresh token and invalidates the previous one", async () => {
    const login = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/login`)
      .send({ email: CUSTOMER.email, password: CUSTOMER.password })
      .expect(200);

    const cookiesOf = (res: { headers: Record<string, unknown> }): string[] =>
      (res.headers["set-cookie"] as string[]).map(
        (cookie) => cookie.split(";")[0],
      );

    const original = cookiesOf(login).find((cookie) =>
      cookie.startsWith("refreshToken="),
    )!;

    const rotated = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/refresh`)
      .set("Cookie", original)
      .expect(200);
    expect(rotated.body.data.user.email).toBe(CUSTOMER.email);

    // The consumed token is revoked server-side: replaying it must fail.
    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/refresh`)
      .set("Cookie", original)
      .expect(401);

    // The replacement token is still valid.
    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/refresh`)
      .set(
        "Cookie",
        cookiesOf(rotated).find((c) => c.startsWith("refreshToken="))!,
      )
      .expect(200);
  });

  // -------------------------------------------------------------------------
  // Catalog + authorization
  // -------------------------------------------------------------------------

  it("lets a provider create a listing with a server-derived slug", async () => {
    const res = await provider
      .post(`/${API_PREFIX}/provider/gear`)
      .send({
        name: "دوربین کانن EOS R6",
        description: "دوربین فول‌فریم برای تست یکپارچه.",
        categoryId,
        brand: "Canon",
        images: ["/images/cameras.svg"],
        pricePerDay: 7_000_000,
        stock: 2,
        specifications: { حسگر: "فول‌فریم", لنز: "۲۴–۱۰۵" },
      })
      .expect(201);

    gearId = res.body.data.id;
    gearSlug = res.body.data.slug;
    expect(gearId).toBeDefined();
    expect(res.body.data.pricePerDay).toBe(7_000_000);
    expect(res.body.data.availableStock).toBe(2);
  });

  it("keeps a customer out of the provider area", async () => {
    await customer
      .post(`/${API_PREFIX}/provider/gear`)
      .send({
        name: "تلاش غیرمجاز",
        description: "نباید ثبت شود.",
        categoryId,
        pricePerDay: 1_000,
        stock: 1,
      })
      .expect(403);
  });

  it("serves a paginated, enveloped public catalog", async () => {
    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/gear?limit=5`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toEqual({
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1,
    });
  });

  it("returns gear detail with reviews and related listings", async () => {
    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/gear/${gearSlug}`)
      .expect(200);

    expect(res.body.data.id).toBe(gearId);
    expect(Array.isArray(res.body.data.reviews)).toBe(true);
    expect(Array.isArray(res.body.data.related)).toBe(true);
  });

  it("hides unknown listings", async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/gear/does-not-exist`)
      .expect(404);
  });

  // -------------------------------------------------------------------------
  // Bookings: server-side pricing + conflict prevention
  // -------------------------------------------------------------------------

  let firstOrderId: string;

  it("computes the order total on the server, ignoring client-supplied prices", async () => {
    const res = await customer
      .post(`/${API_PREFIX}/rentals`)
      .send({
        startDate: isoDay(3),
        endDate: isoDay(6), // 3 days
        items: [{ gearItemId: gearId, quantity: 1 }],
        totalAmount: 1, // must be ignored
        status: "PAID", // must be ignored
      })
      .expect(201);

    expect(res.body.data.totalAmount).toBe(21_000_000); // 3 × 7,000,000
    expect(res.body.data.status).toBe("PLACED");
    firstOrderId = res.body.data.id;
  });

  it("rejects a booking that overlaps dates already held", async () => {
    // The listing has stock 2 and one unit is already held on these dates, so
    // requesting 2 more units must be refused (the check is quantity-aware,
    // not date-only).
    const res = await customer
      .post(`/${API_PREFIX}/rentals`)
      .send({
        startDate: isoDay(4),
        endDate: isoDay(5),
        items: [{ gearItemId: gearId, quantity: 2 }],
      })
      .expect(409);

    expect(res.body.message).toContain("در دسترس نیست");
  });

  it("still allows a booking that only overlaps within the remaining stock", async () => {
    // One unit is free on these dates, so a single-unit request succeeds.
    await customer
      .post(`/${API_PREFIX}/rentals`)
      .send({
        startDate: isoDay(4),
        endDate: isoDay(5),
        items: [{ gearItemId: gearId, quantity: 1 }],
      })
      .expect(201);

    // Both units are now held — a third overlapping request must fail.
    await customer
      .post(`/${API_PREFIX}/rentals`)
      .send({
        startDate: isoDay(4),
        endDate: isoDay(5),
        items: [{ gearItemId: gearId, quantity: 1 }],
      })
      .expect(409);
  });

  it("allows a non-overlapping booking", async () => {
    const res = await customer
      .post(`/${API_PREFIX}/rentals`)
      .send({
        startDate: isoDay(10),
        endDate: isoDay(12),
        items: [{ gearItemId: gearId, quantity: 1 }],
      })
      .expect(201);

    expect(res.body.data.totalAmount).toBe(14_000_000); // 2 × 7,000,000
  });

  it("rejects an end date that is not after the start date", async () => {
    await customer
      .post(`/${API_PREFIX}/rentals`)
      .send({
        startDate: isoDay(20),
        endDate: isoDay(20),
        items: [{ gearItemId: gearId, quantity: 1 }],
      })
      .expect(400);
  });

  // -------------------------------------------------------------------------
  // Status transitions
  // -------------------------------------------------------------------------

  it("rejects an illegal status transition", async () => {
    await provider
      .patch(`/${API_PREFIX}/provider/orders/${firstOrderId}`)
      .send({ status: "RETURNED" }) // PLACED → RETURNED is not allowed
      .expect(409);
  });

  it("lets the provider confirm, hand over and return an order", async () => {
    await provider
      .patch(`/${API_PREFIX}/provider/orders/${firstOrderId}`)
      .send({ status: "CONFIRMED" })
      .expect(200);
    // `PAID` is not an assignable status at all — only the payment flow may
    // settle an order — so the DTO rejects it before the state machine runs.
    await provider
      .patch(`/${API_PREFIX}/provider/orders/${firstOrderId}`)
      .send({ status: "PAID" })
      .expect(400);

    await customer
      .post(`/${API_PREFIX}/payments/create`)
      .send({ rentalOrderId: firstOrderId })
      .expect(201)
      .then(async (res) => {
        expect(res.body.data.redirectUrl).toContain("/payments/simulate/");
        const paymentId = res.body.data.payment.id;

        const gateway = await request(app.getHttpServer())
          .get(`/${API_PREFIX}/payments/simulate/${paymentId}`)
          .expect(200);
        expect(gateway.text).toContain("آزمایشی");

        await customer
          .post(`/${API_PREFIX}/payments/${paymentId}/complete`)
          .expect(303);

        const order = await customer
          .get(`/${API_PREFIX}/rentals/${firstOrderId}`)
          .expect(200);
        expect(order.body.data.status).toBe("PAID");
      });

    await provider
      .patch(`/${API_PREFIX}/provider/orders/${firstOrderId}`)
      .send({ status: "PICKED_UP" })
      .expect(200);
    await provider
      .patch(`/${API_PREFIX}/provider/orders/${firstOrderId}`)
      .send({ status: "RETURNED" })
      .expect(200);
  });

  // -------------------------------------------------------------------------
  // Reviews
  // -------------------------------------------------------------------------

  it("accepts a review from a customer with a rental history", async () => {
    const res = await customer
      .post(`/${API_PREFIX}/reviews`)
      .send({ gearId, rating: 5, comment: "دوربین عالی بود، تحویل سر وقت." })
      .expect(201);

    expect(res.body.data.rating).toBe(5);
  });

  it("rejects a duplicate review for the same listing", async () => {
    await customer
      .post(`/${API_PREFIX}/reviews`)
      .send({ gearId, rating: 4, comment: "نظر تکراری." })
      .expect(409);
  });

  it("rejects a review for a listing the customer never rented", async () => {
    const other = await provider
      .post(`/${API_PREFIX}/provider/gear`)
      .send({
        name: "کالای بدون اجاره",
        description: "برای آزمون نظردهی بدون سابقه.",
        categoryId,
        pricePerDay: 500_000,
        stock: 1,
      })
      .expect(201);

    await customer
      .post(`/${API_PREFIX}/reviews`)
      .send({ gearId: other.body.data.id, rating: 5, comment: "بدون سابقه." })
      .expect(403);
  });

  // -------------------------------------------------------------------------
  // Dashboards
  // -------------------------------------------------------------------------

  it("returns provider dashboard statistics", async () => {
    const res = await provider
      .get(`/${API_PREFIX}/provider/dashboard`)
      .expect(200);

    expect(res.body.data.totalGear).toBeGreaterThanOrEqual(2);
    expect(res.body.data.revenueByMonth).toHaveLength(6);
  });

  it("keeps provider dashboards away from customers", async () => {
    await customer.get(`/${API_PREFIX}/provider/dashboard`).expect(403);
  });

  it("returns admin dashboard statistics", async () => {
    const admin = request.agent(app.getHttpServer());
    await admin
      .post(`/${API_PREFIX}/auth/login`)
      .send({ email: "admin-e2e@rentino.ir", password: "Password1" })
      .expect(200);

    const res = await admin.get(`/${API_PREFIX}/admin/dashboard`).expect(200);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(3);
    expect(Array.isArray(res.body.data.ordersByStatus)).toBe(true);
  });
});
