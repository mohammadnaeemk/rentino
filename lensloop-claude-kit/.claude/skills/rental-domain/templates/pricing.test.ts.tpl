import { describe, expect, it } from "vitest";
import { cancellationRefund, lateFee, multiplierForDay, quote, rentalFee } from "./pricing";

const RATE = 1_000_000; // 100,000 Toman per day

describe("multiplierForDay", () => {
  it("uses the highest applicable tier", () => {
    expect(multiplierForDay(1)).toBe(1);
    expect(multiplierForDay(2)).toBe(1);
    expect(multiplierForDay(3)).toBe(0.9);
    expect(multiplierForDay(6)).toBe(0.9);
    expect(multiplierForDay(7)).toBe(0.8);
    expect(multiplierForDay(30)).toBe(0.7);
  });
  it("defaults to 1 without tiers", () => {
    expect(multiplierForDay(10, [])).toBe(1);
  });
});

describe("rentalFee", () => {
  it("1 day = base rate", () => expect(rentalFee(RATE, 1)).toBe(1_000_000));
  it("3 days = 1.0 + 1.0 + 0.9", () => expect(rentalFee(RATE, 3)).toBe(2_900_000));
  it("7 days = 2*1.0 + 4*0.9 + 1*0.8", () => expect(rentalFee(RATE, 7)).toBe(6_400_000));
  it("rounds to 1000 Rial", () => expect(rentalFee(1_234_567, 1) % 1000).toBe(0));
  it("rejects invalid days", () => {
    expect(() => rentalFee(RATE, 0)).toThrow(RangeError);
    expect(() => rentalFee(RATE, 1.5)).toThrow(RangeError);
  });
});

describe("quote", () => {
  const items = [{ dailyRate: RATE, deposit: 5_000_000 }, { dailyRate: 500_000, deposit: 2_000_000 }];
  it("sums items, adds delivery and refundable deposit", () => {
    const q = quote({ items, start: "2026-10-10", end: "2026-10-12", deliveryFee: 300_000 });
    expect(q.days).toBe(3);
    expect(q.rental).toBe(2_900_000 + 1_450_000);
    expect(q.deposit).toBe(7_000_000);
    expect(q.payable).toBe(q.rental + 300_000 + 7_000_000);
  });
  it("applies vat on rental minus discount plus delivery, never on deposit", () => {
    const q = quote({ items: [items[0]], start: "2026-10-10", end: "2026-10-10", discount: 100_000, deliveryFee: 100_000, vatRate: 0.1 });
    expect(q.vat).toBe(100_000); // 10% of (1,000,000 - 100,000 + 100,000)
    expect(q.payable).toBe(1_000_000 - 100_000 + 100_000 + 100_000 + 5_000_000);
  });
  it("caps discount at the rental amount", () => {
    const q = quote({ items: [items[0]], start: "2026-10-10", end: "2026-10-10", discount: 9_999_999 });
    expect(q.discount).toBe(1_000_000);
    expect(q.payable).toBe(5_000_000);
  });
  it("rejects reversed ranges and empty carts", () => {
    expect(() => quote({ items, start: "2026-10-12", end: "2026-10-10" })).toThrow(RangeError);
    expect(() => quote({ items: [], start: "2026-10-10", end: "2026-10-10" })).toThrow(RangeError);
  });
});

describe("lateFee and cancellation", () => {
  it("late fee is 1.5x per overdue day", () => expect(lateFee(RATE, 2)).toBe(3_000_000));
  it("no negative late fee", () => expect(lateFee(RATE, -3)).toBe(0));
  it("free cancellation 24h or more before start", () => {
    expect(cancellationRefund({ rental: 2_000_000, deposit: 5_000_000, hoursBeforeStart: 24, handedOver: false }))
      .toEqual({ rentalRefund: 2_000_000, depositRefund: 5_000_000 });
  });
  it("50% rental retained when late", () => {
    expect(cancellationRefund({ rental: 2_000_000, deposit: 5_000_000, hoursBeforeStart: 5, handedOver: false }))
      .toEqual({ rentalRefund: 1_000_000, depositRefund: 5_000_000 });
  });
  it("nothing refunded by cancel after handover", () => {
    expect(cancellationRefund({ rental: 2_000_000, deposit: 5_000_000, hoursBeforeStart: 100, handedOver: true }))
      .toEqual({ rentalRefund: 0, depositRefund: 0 });
  });
});
