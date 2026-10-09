// lib/domain/dates.ts — calendar-day helpers. IsoDate = "YYYY-MM-DD" (Gregorian).
// All math uses UTC midnight so it never drifts with time zones or DST.
export type IsoDate = string;

const DAY_MS = 86_400_000;

export function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
}

function parse(d: IsoDate): number {
  if (!isIsoDate(d)) throw new Error(`Invalid IsoDate: ${d}`);
  return Date.parse(`${d}T00:00:00Z`);
}

export const diffDays = (a: IsoDate, b: IsoDate): number => Math.round((parse(b) - parse(a)) / DAY_MS);

/** Inclusive calendar days: Saturday to Monday = 3 (D-005). */
export const rentalDays = (start: IsoDate, end: IsoDate): number => diffDays(start, end) + 1;

export const addDays = (d: IsoDate, n: number): IsoDate => new Date(parse(d) + n * DAY_MS).toISOString().slice(0, 10);

/** Inclusive range overlap. ISO strings compare correctly as text. */
export const overlaps = (aStart: IsoDate, aEnd: IsoDate, bStart: IsoDate, bEnd: IsoDate): boolean =>
  aStart <= bEnd && bStart <= aEnd;

export function eachDay(start: IsoDate, end: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Today's calendar date in Tehran, regardless of server time zone. */
export const todayInTehran = (now: Date = new Date()): IsoDate =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
