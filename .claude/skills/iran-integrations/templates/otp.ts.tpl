// lib/auth/otp.ts — OTP primitives. Storage (DB/Redis) and the SMS provider are injected, never hard-coded.
// Server-only: import only from server actions / route handlers.
import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 120;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_SECONDS = 120;
export const OTP_LOCK_SECONDS = 600;

export const generateOtp = (): string => String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");

/** Hash with a server-side pepper and the phone, so a leaked table is useless. */
export const hashOtp = (code: string, phone: string, pepper: string): string =>
  createHash("sha256").update(`${pepper}:${phone}:${code}`).digest("hex");

export function verifyOtp(code: string, phone: string, pepper: string, storedHash: string): boolean {
  const a = Buffer.from(hashOtp(code, phone, pepper), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface OtpRecord { hash: string; expiresAt: number; attempts: number; lockedUntil?: number; sentAt: number }

export type OtpCheck =
  | { ok: true }
  | { ok: false; reason: "expired" | "locked" | "wrong"; attemptsLeft?: number };

/** Pure decision: caller persists the returned record. */
export function checkOtp(
  rec: OtpRecord, code: string, phone: string, pepper: string, now: number = Date.now(),
): { result: OtpCheck; next: OtpRecord } {
  if (rec.lockedUntil && rec.lockedUntil > now) return { result: { ok: false, reason: "locked" }, next: rec };
  if (rec.expiresAt <= now) return { result: { ok: false, reason: "expired" }, next: rec };
  if (verifyOtp(code, phone, pepper, rec.hash)) return { result: { ok: true }, next: { ...rec, expiresAt: 0 } }; // single use
  const attempts = rec.attempts + 1;
  const locked = attempts >= OTP_MAX_ATTEMPTS;
  const next = { ...rec, attempts, lockedUntil: locked ? now + OTP_LOCK_SECONDS * 1000 : rec.lockedUntil };
  return { result: { ok: false, reason: locked ? "locked" : "wrong", attemptsLeft: Math.max(0, OTP_MAX_ATTEMPTS - attempts) }, next };
}

export const canResend = (rec: OtpRecord | undefined, now: number = Date.now()): boolean =>
  !rec || now - rec.sentAt >= OTP_RESEND_SECONDS * 1000;
