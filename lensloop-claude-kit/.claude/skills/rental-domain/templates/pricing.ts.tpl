// lib/domain/pricing.ts — pure pricing rules from docs/DOMAIN.md. Money is integer Rial (D-003).
import { rentalDays, type IsoDate } from "./dates";

export type Rial = number & { readonly __brand: "Rial" };

export interface PriceTier { fromDay: number; multiplier: number }

export const DEFAULT_TIERS: PriceTier[] = [
  { fromDay: 1, multiplier: 1 },
  { fromDay: 3, multiplier: 0.9 },
  { fromDay: 7, multiplier: 0.8 },
  { fromDay: 14, multiplier: 0.7 },
];

/** Multiplier of the highest tier whose fromDay <= day (default 1). */
export function multiplierForDay(day: number, tiers: PriceTier[] = DEFAULT_TIERS): number {
  let multiplier = 1;
  let best = 0;
  for (const t of tiers) {
    if (t.fromDay <= day && t.fromDay >= best) {
      multiplier = t.multiplier;
      best = t.fromDay;
    }
  }
  return multiplier;
}

export const roundRial = (n: number, step = 1000): Rial => (Math.round(n / step) * step) as Rial;

/** Rental fee for ONE unit over `days` inclusive days. */
export function rentalFee(dailyRate: number, days: number, tiers: PriceTier[] = DEFAULT_TIERS): Rial {
  if (!Number.isInteger(days) || days < 1) throw new RangeError("days must be an integer >= 1");
  let sum = 0;
  for (let d = 1; d <= days; d++) sum += dailyRate * multiplierForDay(d, tiers);
  return roundRial(sum);
}

export interface QuoteItem { dailyRate: number; deposit: number; tiers?: PriceTier[] }
export interface QuoteInput {
  items: QuoteItem[];
  start: IsoDate;
  end: IsoDate;
  deliveryFee?: number;
  discount?: number;
  vatRate?: number; // 0..1, default 0 (A-6)
}
export interface Quote {
  days: number;
  rental: Rial;
  discount: Rial;
  delivery: Rial;
  vat: Rial;
  deposit: Rial;
  payable: Rial;
}

export function quote(input: QuoteInput): Quote {
  const days = rentalDays(input.start, input.end);
  if (days < 1) throw new RangeError("end must not be before start");
  if (input.items.length === 0) throw new RangeError("at least one item is required");

  const rental = input.items.reduce((s, i) => s + rentalFee(i.dailyRate, days, i.tiers), 0);
  const discount = Math.min(Math.max(input.discount ?? 0, 0), rental);
  const delivery = input.deliveryFee ?? 0;
  const vat = Math.round((input.vatRate ?? 0) * (rental - discount + delivery));
  const deposit = input.items.reduce((s, i) => s + i.deposit, 0);
  const payable = rental - discount + delivery + vat + deposit;

  return {
    days,
    rental: rental as Rial,
    discount: discount as Rial,
    delivery: delivery as Rial,
    vat: vat as Rial,
    deposit: deposit as Rial,
    payable: payable as Rial,
  };
}

/** Late fee: factor x daily rate per overdue day (default 1.5). */
export const lateFee = (dailyRate: number, overdueDays: number, factor = 1.5): Rial =>
  roundRial(dailyRate * factor * Math.max(0, overdueDays));

export interface CancelInput {
  rental: number;
  deposit: number;
  hoursBeforeStart: number;
  handedOver: boolean;
  freeHours?: number; // default 24
  lateRetention?: number; // share of rental kept when late, default 0.5
}

/** Refund policy from docs/DOMAIN.md. After handover nothing is refunded by cancellation. */
export function cancellationRefund(i: CancelInput): { rentalRefund: Rial; depositRefund: Rial } {
  if (i.handedOver) return { rentalRefund: 0 as Rial, depositRefund: 0 as Rial };
  const free = i.hoursBeforeStart >= (i.freeHours ?? 24);
  const keep = free ? 0 : (i.lateRetention ?? 0.5);
  return { rentalRefund: roundRial(i.rental * (1 - keep)), depositRefund: i.deposit as Rial };
}
