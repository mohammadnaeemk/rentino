// lib/validators.ts — Iran-specific validators. Pure. Pair with lib/format.ts (parseDigits).
const toAscii = (v: string): string =>
  v.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

/** Normalize any common Iranian mobile notation to "09XXXXXXXXX". Returns the cleaned input if it cannot be normalized. */
export function normalizePhone(input: string): string {
  let s = toAscii(input).replace(/[\s\-()]/g, "");
  if (s.startsWith("+98")) s = "0" + s.slice(3);
  else if (s.startsWith("0098")) s = "0" + s.slice(4);
  else if (s.startsWith("98") && s.length === 12) s = "0" + s.slice(2);
  else if (/^9\d{9}$/.test(s)) s = "0" + s;
  return s;
}

export const isValidMobile = (input: string): boolean => /^09\d{9}$/.test(normalizePhone(input));

/** Iranian national code (کد ملی): 10 digits, not all equal, mod-11 checksum. */
export function isValidNationalCode(input: string): boolean {
  const s = toAscii(input).trim();
  if (!/^\d{10}$/.test(s)) return false;
  if (/^(\d)\1{9}$/.test(s)) return false;
  const check = Number(s[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(s[i]) * (10 - i);
  const r = sum % 11;
  return r < 2 ? check === r : check === 11 - r;
}

/** Sheba / IBAN: "IR" + 24 digits, ISO 7064 mod 97-10. Input may contain spaces. */
export function isValidSheba(input: string): boolean {
  const s = toAscii(input).replace(/\s/g, "").toUpperCase();
  if (!/^IR\d{24}$/.test(s)) return false;
  const rearranged = s.slice(4) + "1827" + s.slice(2, 4); // I=18, R=27
  let rem = 0;
  for (const ch of rearranged) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}

/** 16-digit bank card number with Luhn check. */
export function isValidCardNumber(input: string): boolean {
  const s = toAscii(input).replace(/[\s-]/g, "");
  if (!/^\d{16}$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let d = Number(s[15 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}
