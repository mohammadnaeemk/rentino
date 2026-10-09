// lib/domain/availability.ts — availability rules from docs/DOMAIN.md.
// Pure functions over a list of reservations. The repository must run check + create atomically (see skill).
import { addDays, eachDay, overlaps, type IsoDate } from "./dates";
import type { BookingStatus } from "./booking-state";

export interface Reservation {
  unitId: string;
  start: IsoDate;
  end: IsoDate;
  status: BookingStatus;
  expiresAt?: string; // payment hold (ISO datetime)
}

const BLOCKING: BookingStatus[] = ["pending_payment", "confirmed", "ready", "active", "overdue"];

export function isBlocking(r: Reservation, now: number = Date.now()): boolean {
  if (!BLOCKING.includes(r.status)) return false;
  if (r.status === "pending_payment" && r.expiresAt && Date.parse(r.expiresAt) <= now) return false;
  return true;
}

/** A unit is free if no blocking reservation overlaps [start - buffer, end + buffer]. */
export function isUnitFree(
  unitId: string, start: IsoDate, end: IsoDate, reservations: Reservation[], bufferDays = 1, now: number = Date.now(),
): boolean {
  const from = addDays(start, -bufferDays);
  const to = addDays(end, bufferDays);
  return !reservations.some((r) => r.unitId === unitId && isBlocking(r, now) && overlaps(from, to, r.start, r.end));
}

export function freeUnits(
  unitIds: string[], start: IsoDate, end: IsoDate, reservations: Reservation[], bufferDays = 1, now: number = Date.now(),
): string[] {
  return unitIds.filter((id) => isUnitFree(id, start, end, reservations, bufferDays, now));
}

/** Pick `qty` free units (first come), or null if not enough. */
export function assignUnits(
  unitIds: string[], qty: number, start: IsoDate, end: IsoDate, reservations: Reservation[], bufferDays = 1, now: number = Date.now(),
): string[] | null {
  const free = freeUnits(unitIds, start, end, reservations, bufferDays, now);
  return free.length >= qty ? free.slice(0, qty) : null;
}

/** Days that cannot start or hold a single-day rental (for disabling days in the date picker). */
export function unavailableDays(
  unitIds: string[], from: IsoDate, to: IsoDate, reservations: Reservation[], qty = 1, bufferDays = 1, now: number = Date.now(),
): IsoDate[] {
  return eachDay(from, to).filter((d) => freeUnits(unitIds, d, d, reservations, bufferDays, now).length < qty);
}

/** First start date (from `from`) where `days` consecutive days are free for `qty` units; null within the horizon. */
export function nextAvailableStart(
  unitIds: string[], qty: number, days: number, from: IsoDate, reservations: Reservation[], bufferDays = 1, horizonDays = 120, now: number = Date.now(),
): IsoDate | null {
  for (let i = 0; i <= horizonDays; i++) {
    const start = addDays(from, i);
    const end = addDays(start, days - 1);
    if (assignUnits(unitIds, qty, start, end, reservations, bufferDays, now)) return start;
  }
  return null;
}
