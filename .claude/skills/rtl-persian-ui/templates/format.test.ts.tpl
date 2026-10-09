import { describe, expect, it } from "vitest";
import {
  formatDays, formatJalali, formatJalaliDateTime, formatJalaliRange, formatJalaliWeekday, formatNumber, formatRelative,
  formatToman, normalizeFa, parseDigits, toEnDigits, toFaDigits,
} from "./format";

const NBSP = " ";

describe("digits", () => {
  it("converts to Persian digits", () => expect(toFaDigits("0912 7")).toBe("۰۹۱۲ ۷"));
  it("converts Persian and Arabic digits to ASCII", () => expect(toEnDigits("۰۹۱۲٣")).toBe("09123"));
  it("parseDigits strips separators", () => expect(parseDigits("۰۹۱۲-۳۴۵ ۶۷")).toBe("091234567"));
  it("normalizeFa unifies letters, digits, ZWNJ and case", () => {
    expect(normalizeFa("  كتاب‌هاي   ۱۲ Sony  ")).toBe("کتاب های 12 sony");
    expect(normalizeFa("دوربين")).toBe(normalizeFa("دوربین"));
  });
});

describe("money and numbers", () => {
  it("formats Rial as Toman with separators", () => {
    expect(formatToman(2_500_000)).toBe(`۲۵۰٬۰۰۰${NBSP}تومان`);
    expect(formatToman(2_500_000, false)).toBe("۲۵۰٬۰۰۰");
  });
  it("rounds sub-Toman amounts", () => expect(formatToman(14)).toBe(`۱${NBSP}تومان`));
  it("formats numbers and days", () => {
    expect(formatNumber(1_234_567)).toBe("۱٬۲۳۴٬۵۶۷");
    expect(formatDays(3)).toBe(`۳${NBSP}روز`);
  });
});

describe("Jalali dates", () => {
  it("formats an ISO calendar day", () => {
    expect(formatJalali("2026-10-08")).toBe("۱۶ مهر ۱۴۰۵");
    expect(formatJalali("2026-10-08", "short")).toBe("۱۴۰۵/۷/۱۶");
  });
  it("formats weekday", () => expect(formatJalaliWeekday("2026-10-08")).toBe("پنجشنبه، ۱۶ مهر ۱۴۰۵"));
  it("formats ranges", () => {
    expect(formatJalaliRange("2026-10-08", "2026-10-10")).toBe("۱۶ تا ۱۸ مهر ۱۴۰۵");
    expect(formatJalaliRange("2026-10-08", "2026-11-02")).toBe("۱۶ مهر ۱۴۰۵ تا ۱۱ آبان ۱۴۰۵");
    expect(formatJalaliRange("2026-10-08", "2026-10-08")).toBe("۱۶ مهر ۱۴۰۵");
  });
  it("shows Tehran time", () => expect(formatJalaliDateTime("2026-10-08T10:30:00Z")).toBe("۱۶ مهر ۱۴۰۵، ۱۴:۰۰"));
  it("Nowruz 1405 is 20 March 2026 (1 Farvardin)", () => expect(formatJalali("2026-03-21")).toBe("۱ فروردین ۱۴۰۵"));
});

describe("relative time", () => {
  const now = new Date("2026-10-08T12:00:00Z");
  it("hours ago", () => expect(formatRelative("2026-10-08T09:00:00Z", now)).toBe("۳ ساعت پیش"));
  it("yesterday", () => expect(formatRelative("2026-10-07T12:00:00Z", now)).toBe("دیروز"));
});
