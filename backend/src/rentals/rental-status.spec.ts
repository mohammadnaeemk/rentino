import { RentalStatus } from "@prisma/client";
import {
  canTransition,
  allowedTransitions,
  BLOCKING_STATUSES,
  RESERVING_STATUSES,
} from "./rental-status";

describe("rental status machine", () => {
  it("lets a provider confirm or cancel a placed order", () => {
    expect(
      canTransition(RentalStatus.PLACED, RentalStatus.CONFIRMED, "PROVIDER"),
    ).toBe(true);
    expect(
      canTransition(RentalStatus.PLACED, RentalStatus.CANCELLED, "PROVIDER"),
    ).toBe(true);
  });

  it("lets a customer cancel a placed or confirmed order but not confirm it", () => {
    expect(
      canTransition(RentalStatus.PLACED, RentalStatus.CANCELLED, "CUSTOMER"),
    ).toBe(true);
    expect(
      canTransition(RentalStatus.CONFIRMED, RentalStatus.CANCELLED, "CUSTOMER"),
    ).toBe(true);
    expect(
      canTransition(RentalStatus.PLACED, RentalStatus.CONFIRMED, "CUSTOMER"),
    ).toBe(false);
  });

  it("only moves money-bearing states forward through the hand-over path", () => {
    expect(
      canTransition(RentalStatus.PAID, RentalStatus.PICKED_UP, "PROVIDER"),
    ).toBe(true);
    expect(
      canTransition(RentalStatus.PICKED_UP, RentalStatus.RETURNED, "PROVIDER"),
    ).toBe(true);
    expect(
      canTransition(RentalStatus.PAID, RentalStatus.RETURNED, "PROVIDER"),
    ).toBe(false);
  });

  it("settles payments through the SYSTEM actor only", () => {
    expect(
      canTransition(RentalStatus.PLACED, RentalStatus.PAID, "SYSTEM"),
    ).toBe(true);
    expect(
      canTransition(RentalStatus.CONFIRMED, RentalStatus.PAID, "SYSTEM"),
    ).toBe(true);
    expect(
      canTransition(RentalStatus.PLACED, RentalStatus.PAID, "PROVIDER"),
    ).toBe(false);
  });

  it("treats RETURNED and CANCELLED as terminal", () => {
    for (const actor of ["CUSTOMER", "PROVIDER", "SYSTEM"] as const) {
      expect(allowedTransitions(RentalStatus.RETURNED, actor)).toEqual([]);
      expect(allowedTransitions(RentalStatus.CANCELLED, actor)).toEqual([]);
    }
  });

  it("never lets an actor skip a state (PLACED → RETURNED)", () => {
    expect(
      canTransition(RentalStatus.PLACED, RentalStatus.RETURNED, "PROVIDER"),
    ).toBe(false);
    expect(
      canTransition(RentalStatus.PLACED, RentalStatus.PICKED_UP, "PROVIDER"),
    ).toBe(false);
  });

  it("keeps the reserving statuses a subset of the blocking statuses", () => {
    for (const status of RESERVING_STATUSES) {
      expect(BLOCKING_STATUSES).toContain(status);
    }
    // Cancelled and returned orders free the dates again.
    expect(BLOCKING_STATUSES).not.toContain(RentalStatus.CANCELLED);
    expect(BLOCKING_STATUSES).not.toContain(RentalStatus.RETURNED);
  });
});
