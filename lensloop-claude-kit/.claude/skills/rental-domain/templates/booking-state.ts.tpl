// lib/domain/booking-state.ts — status machine from docs/DOMAIN.md. Pure; illegal transitions throw.
export type BookingStatus =
  | "draft" | "pending_payment" | "confirmed" | "ready" | "active" | "overdue"
  | "returned" | "completed" | "cancelled" | "expired" | "failed" | "disputed";

export const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["confirmed", "expired", "failed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  ready: ["active", "cancelled"],
  active: ["overdue", "returned"],
  overdue: ["returned"],
  returned: ["completed", "disputed"],
  disputed: ["completed"],
  completed: [],
  cancelled: [],
  expired: [],
  failed: [],
};

export const STATUS_LABEL_FA: Record<BookingStatus, string> = {
  draft: "پیش‌نویس",
  pending_payment: "در انتظار پرداخت",
  confirmed: "تأیید شده",
  ready: "آماده تحویل",
  active: "در حال اجاره",
  overdue: "دیرکرد",
  returned: "بازگشت داده شده",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
  expired: "منقضی شده",
  failed: "پرداخت ناموفق",
  disputed: "در حال بررسی",
};

export const canTransition = (from: BookingStatus, to: BookingStatus): boolean => TRANSITIONS[from].includes(to);
export const allowedNext = (from: BookingStatus): BookingStatus[] => TRANSITIONS[from];
export const isTerminal = (s: BookingStatus): boolean => TRANSITIONS[s].length === 0;

export function transition(from: BookingStatus, to: BookingStatus): BookingStatus {
  if (!canTransition(from, to)) throw new Error(`Illegal booking transition: ${from} -> ${to}`);
  return to;
}

export interface AuditEntry { bookingId: string; from: BookingStatus; to: BookingStatus; by: string; at: string; note?: string }

export function audit(bookingId: string, from: BookingStatus, to: BookingStatus, by: string, note?: string, at = new Date().toISOString()): AuditEntry {
  transition(from, to);
  return { bookingId, from, to, by, at, note };
}
