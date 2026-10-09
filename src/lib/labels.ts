import type {
  GearAvailability,
  PaymentStatus,
  RentalStatus,
  Role,
} from "@/types";

/** Single source of truth for Persian status/role labels. */
export const roleLabel: Record<Role, string> = {
  CUSTOMER: "مشتری",
  PROVIDER: "تأمین‌کننده",
  ADMIN: "مدیر",
};

export const rentalStatusLabel: Record<RentalStatus, string> = {
  PLACED: "ثبت‌شده",
  CONFIRMED: "تأیید شده",
  PAID: "پرداخت شده",
  PICKED_UP: "تحویل گرفته‌شده",
  RETURNED: "بازگردانده‌شده",
  CANCELLED: "لغو شده",
};

export const availabilityLabel: Record<GearAvailability, string> = {
  AVAILABLE: "موجود",
  RENTED: "در اجاره",
  MAINTENANCE: "در تعمیر",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "در انتظار پرداخت",
  COMPLETED: "پرداخت موفق",
  FAILED: "پرداخت ناموفق",
};
