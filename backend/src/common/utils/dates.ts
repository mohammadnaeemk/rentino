/** The marketplace's display timezone — rental days are calendar days here. */
export const APP_TIMEZONE = "Asia/Tehran";

const dateOnlyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Normalises an incoming rental date to UTC midnight of the intended calendar
 * day (Tehran time). Accepts `YYYY-MM-DD` and full ISO date-times.
 */
export function parseCalendarDate(value: string): Date | null {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const [year, month, day] = dateOnlyFormatter
    .format(parsed)
    .split("-")
    .map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

/** Formats a stored date as `YYYY-MM-DD`. */
export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Whole days between two calendar dates (endDate is exclusive). */
export function nightsBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}
