import { describe, expect, it } from "vitest";
import { OTP_MAX_ATTEMPTS, canResend, checkOtp, generateOtp, hashOtp, type OtpRecord } from "./otp";

const PEPPER = "test-pepper";
const PHONE = "09123456789";
const NOW = 1_000_000_000_000;
const record = (code: string, over: Partial<OtpRecord> = {}): OtpRecord => ({
  hash: hashOtp(code, PHONE, PEPPER), expiresAt: NOW + 120_000, attempts: 0, sentAt: NOW, ...over,
});

describe("otp", () => {
  it("generates 6 digit codes", () => {
    for (let i = 0; i < 200; i++) expect(generateOtp()).toMatch(/^\d{6}$/);
  });
  it("accepts the right code once", () => {
    const rec = record("123456");
    const first = checkOtp(rec, "123456", PHONE, PEPPER, NOW);
    expect(first.result).toEqual({ ok: true });
    const second = checkOtp(first.next, "123456", PHONE, PEPPER, NOW + 1);
    expect(second.result).toEqual({ ok: false, reason: "expired" });
  });
  it("rejects wrong codes and counts attempts", () => {
    const { result, next } = checkOtp(record("123456"), "000000", PHONE, PEPPER, NOW);
    expect(result).toEqual({ ok: false, reason: "wrong", attemptsLeft: OTP_MAX_ATTEMPTS - 1 });
    expect(next.attempts).toBe(1);
  });
  it("locks after max attempts, even for the right code", () => {
    let rec = record("123456");
    for (let i = 0; i < OTP_MAX_ATTEMPTS; i++) rec = checkOtp(rec, "000000", PHONE, PEPPER, NOW).next;
    expect(checkOtp(rec, "123456", PHONE, PEPPER, NOW + 1000).result).toEqual({ ok: false, reason: "locked" });
  });
  it("expires", () => {
    expect(checkOtp(record("123456"), "123456", PHONE, PEPPER, NOW + 121_000).result).toEqual({ ok: false, reason: "expired" });
  });
  it("code is bound to the phone", () => {
    expect(checkOtp(record("123456"), "123456", "09350000000", PEPPER, NOW).result.ok).toBe(false);
  });
  it("resend cooldown", () => {
    expect(canResend(record("1"), NOW + 60_000)).toBe(false);
    expect(canResend(record("1"), NOW + 120_000)).toBe(true);
    expect(canResend(undefined, NOW)).toBe(true);
  });
});
