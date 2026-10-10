/**
 * Environment for the e2e suite, evaluated before `AppModule` is imported.
 *
 * The suite talks to a DEDICATED test database, never the developer's dev
 * database: `TEST_DATABASE_URL` if set, otherwise `rentino_test` on localhost.
 */
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://rentino:rentino@localhost:5432/rentino_test?schema=public";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_ACCESS_SECRET ??= "test-access-secret";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret";
process.env.JWT_ACCESS_TTL ??= "15m";
process.env.JWT_REFRESH_TTL ??= "7d";
process.env.SWAGGER_ENABLED ??= "false";
process.env.FRONTEND_URL ??= "http://localhost:3000";
process.env.API_PUBLIC_URL ??= "http://localhost:8000";
