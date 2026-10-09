import { describe, expect, it } from "vitest";
import { isValidCardNumber, isValidMobile, isValidNationalCode, isValidSheba, normalizePhone } from "./validators";

describe("phone", () => {
  it("normalizes common notations", () => {
    expect(normalizePhone("09123456789")).toBe("09123456789");
    expect(normalizePhone("+98 912 345 6789")).toBe("09123456789");
    expect(normalizePhone("0098-912-345-6789")).toBe("09123456789");
    expect(normalizePhone("989123456789")).toBe("09123456789");
    expect(normalizePhone("9123456789")).toBe("09123456789");
    expect(normalizePhone("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
  });
  it("validates mobiles", () => {
    expect(isValidMobile("۰۹۱۲۳۴۵۶۷۸۹")).toBe(true);
    expect(isValidMobile("+989351234567")).toBe(true);
    expect(isValidMobile("02112345678")).toBe(false);
    expect(isValidMobile("0912345678")).toBe(false);
    expect(isValidMobile("")).toBe(false);
  });
});

describe("national code", () => {
  it("accepts valid codes (ASCII and Persian digits)", () => {
    expect(isValidNationalCode("0013542419")).toBe(true);
    expect(isValidNationalCode("۰۰۱۳۵۴۲۴۱۹")).toBe(true);
    expect(isValidNationalCode("0499370899")).toBe(true);
  });
  it("rejects wrong checksum, repeats and bad length", () => {
    expect(isValidNationalCode("0013542418")).toBe(false);
    expect(isValidNationalCode("1111111111")).toBe(false);
    expect(isValidNationalCode("0000000000")).toBe(false);
    expect(isValidNationalCode("123")).toBe(false);
    expect(isValidNationalCode("00135424190")).toBe(false);
    expect(isValidNationalCode("abcdefghij")).toBe(false);
  });
});

describe("sheba and card", () => {
  it("validates sheba with mod 97", () => {
    expect(isValidSheba("IR062960000000100324200001")).toBe(true);
    expect(isValidSheba("ir06 2960 0000 0010 0324 2000 01")).toBe(true);
    expect(isValidSheba("IR062960000000100324200002")).toBe(false);
    expect(isValidSheba("IR12")).toBe(false);
  });
  it("validates card numbers with Luhn", () => {
    expect(isValidCardNumber("4111 1111 1111 1111")).toBe(true);
    expect(isValidCardNumber("4111111111111112")).toBe(false);
    expect(isValidCardNumber("123")).toBe(false);
  });
});
