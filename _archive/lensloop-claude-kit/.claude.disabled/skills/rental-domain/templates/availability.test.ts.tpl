import { describe, expect, it } from "vitest";
import { assignUnits, isUnitFree, nextAvailableStart, unavailableDays, type Reservation } from "./availability";
import { allowedNext, canTransition, isTerminal, transition } from "./booking-state";

const NOW = Date.parse("2026-10-08T12:00:00Z");
const res = (over: Partial<Reservation> = {}): Reservation => ({
  unitId: "u1", start: "2026-10-10", end: "2026-10-12", status: "confirmed", ...over,
});

describe("isUnitFree", () => {
  it("is free with no reservations", () => expect(isUnitFree("u1", "2026-10-10", "2026-10-12", [], 1, NOW)).toBe(true));
  it("blocks overlapping ranges", () => expect(isUnitFree("u1", "2026-10-11", "2026-10-14", [res()], 1, NOW)).toBe(false));
  it("buffer day blocks adjacent booking", () => {
    expect(isUnitFree("u1", "2026-10-13", "2026-10-14", [res()], 1, NOW)).toBe(false); // needs 1 free day after 12th
    expect(isUnitFree("u1", "2026-10-14", "2026-10-15", [res()], 1, NOW)).toBe(true);
    expect(isUnitFree("u1", "2026-10-13", "2026-10-14", [res()], 0, NOW)).toBe(true);
  });
  it("applies buffer before an existing booking too", () => {
    expect(isUnitFree("u1", "2026-10-07", "2026-10-09", [res()], 1, NOW)).toBe(false);
    expect(isUnitFree("u1", "2026-10-05", "2026-10-08", [res()], 1, NOW)).toBe(true);
  });
  it("ignores other units and non-blocking statuses", () => {
    expect(isUnitFree("u1", "2026-10-10", "2026-10-12", [res({ unitId: "u2" })], 1, NOW)).toBe(true);
    expect(isUnitFree("u1", "2026-10-10", "2026-10-12", [res({ status: "cancelled" })], 1, NOW)).toBe(true);
    expect(isUnitFree("u1", "2026-10-10", "2026-10-12", [res({ status: "completed" })], 1, NOW)).toBe(true);
  });
  it("unexpired payment hold blocks, expired hold does not", () => {
    const live = res({ status: "pending_payment", expiresAt: "2026-10-08T12:10:00Z" });
    const dead = res({ status: "pending_payment", expiresAt: "2026-10-08T11:50:00Z" });
    expect(isUnitFree("u1", "2026-10-10", "2026-10-12", [live], 1, NOW)).toBe(false);
    expect(isUnitFree("u1", "2026-10-10", "2026-10-12", [dead], 1, NOW)).toBe(true);
  });
  it("overdue units stay blocked", () => {
    expect(isUnitFree("u1", "2026-10-20", "2026-10-21", [res({ status: "overdue", end: "2026-10-20" })], 1, NOW)).toBe(false);
  });
});

describe("assignUnits / nextAvailableStart / unavailableDays", () => {
  const units = ["u1", "u2"];
  it("assigns the first free units", () => {
    expect(assignUnits(units, 1, "2026-10-10", "2026-10-12", [res()], 1, NOW)).toEqual(["u2"]);
    expect(assignUnits(units, 2, "2026-10-10", "2026-10-12", [res()], 1, NOW)).toBeNull();
  });
  it("finds the nearest available start", () => {
    expect(nextAvailableStart(["u1"], 1, 2, "2026-10-10", [res()], 1, 120, NOW)).toBe("2026-10-14");
  });
  it("returns null beyond the horizon", () => {
    expect(nextAvailableStart(["u1"], 1, 2, "2026-10-10", [res({ end: "2027-12-31" })], 1, 30, NOW)).toBeNull();
  });
  it("lists days to disable in the picker", () => {
    expect(unavailableDays(["u1"], "2026-10-08", "2026-10-14", [res()], 1, 1, NOW))
      .toEqual(["2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13"]);
  });
});

describe("booking state machine", () => {
  it("allows the happy path", () => {
    let s = "draft" as const as import("./booking-state").BookingStatus;
    for (const next of ["pending_payment", "confirmed", "ready", "active", "returned", "completed"] as const) s = transition(s, next);
    expect(s).toBe("completed");
  });
  it("rejects illegal jumps", () => {
    expect(() => transition("draft", "active")).toThrow();
    expect(() => transition("completed", "active")).toThrow();
    expect(canTransition("confirmed", "active")).toBe(false);
  });
  it("overdue can only return; terminals have no exits", () => {
    expect(allowedNext("overdue")).toEqual(["returned"]);
    for (const t of ["completed", "cancelled", "expired", "failed"] as const) expect(isTerminal(t)).toBe(true);
  });
});
