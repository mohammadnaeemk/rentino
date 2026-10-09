// lib/format.ts — Persian digits, money and Jalali dates. Pure, zero dependencies (D-003, D-007).
const FA = "۰۱۲۳۴۵۶۷۸۹";
const AR = "٠١٢٣٤٥٦٧٨٩";
const TZ = "Asia/Tehran";
const NBSP = " ";

export const toFaDigits = (v: string | number): string => String(v).replace(/\d/g, (d) => FA[Number(d)]);

export const toEnDigits = (v: string): string =>
  v.replace(/[۰-۹]/g, (d) => String(FA.indexOf(d))).replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)));

/** User-typed numeric input (phone, code, price): any digit script to ASCII, drop separators. */
export const parseDigits = (v: string): string => toEnDigits(v).replace(/[^\d]/g, "");

/** For search and comparison: unify Arabic/Persian letters and digits, drop diacritics, treat ZWNJ as space. */
export function normalizeFa(v: string): string {
  return toEnDigits(v)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[‌‎‏]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const numberFmt = new Intl.NumberFormat("fa-IR");
export const formatNumber = (n: number): string => numberFmt.format(n);

/** Rial in, Toman out (D-003). 2500000 -> "۲۵۰٬۰۰۰ تومان". */
export const formatToman = (rial: number, withUnit = true): string => {
  const t = formatNumber(Math.round(rial / 10));
  return withUnit ? `${t}${NBSP}تومان` : t;
};

export const formatDays = (n: number): string => `${formatNumber(n)}${NBSP}روز`;

const jalali = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: TZ, ...opts });

// "YYYY-MM-DD" is a calendar day: read it as UTC midnight (same day in Tehran).
const toDate = (d: Date | string): Date =>
  typeof d === "string" ? new Date(d.length === 10 ? `${d}T00:00:00Z` : d) : d;

// Do not use dateStyle "full": ICU emits a scrambled order for Persian ("۱۴۰۵ مهر ۱۶, پنجشنبه").
export const formatJalali = (d: Date | string, style: "short" | "medium" | "long" = "medium"): string =>
  jalali({ dateStyle: style }).format(toDate(d));

/** "پنجشنبه، ۱۶ مهر ۱۴۰۵" */
export function formatJalaliWeekday(d: Date | string): string {
  const p = jalali({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).formatToParts(toDate(d));
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${get("weekday")}، ${get("day")} ${get("month")} ${get("year")}`;
}

export const formatJalaliDateTime = (d: Date | string): string =>
  jalali({ dateStyle: "medium", timeStyle: "short" }).format(toDate(d));

/** "۱۶ تا ۱۸ مهر ۱۴۰۵" when in the same month, otherwise two full dates. */
export function formatJalaliRange(start: string, end: string): string {
  const parts = (d: string) => jalali({ day: "numeric", month: "long", year: "numeric" }).formatToParts(toDate(d));
  const get = (p: Intl.DateTimeFormatPart[], t: string) => p.find((x) => x.type === t)?.value ?? "";
  const a = parts(start);
  const b = parts(end);
  if (start === end) return formatJalali(start, "long");
  if (get(a, "month") === get(b, "month") && get(a, "year") === get(b, "year")) {
    return `${get(a, "day")} تا ${get(b, "day")} ${get(b, "month")} ${get(b, "year")}`;
  }
  return `${formatJalali(start, "long")} تا ${formatJalali(end, "long")}`;
}

const rtf = new Intl.RelativeTimeFormat("fa-IR", { numeric: "auto" });
/** "۳ ساعت پیش", "دیروز", "۲ روز دیگر". */
export function formatRelative(target: Date | string, now: Date = new Date()): string {
  const diffSec = Math.round((toDate(target).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), "day");
  return formatJalali(toDate(target), "medium");
}
