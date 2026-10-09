import { describe, expect, it } from "vitest";
import { addDays, diffDays, eachDay, isIsoDate, overlaps, rentalDays, todayInTehran } from "./dates";

describe("dates", () => {
  it("counts inclusive rental days", () => {
    expect(rentalDays("2026-10-08", "2026-10-08")).toBe(1);
    expect(rentalDays("2026-10-08", "2026-10-10")).toBe(3);
  });
  it("handles month and year boundaries", () => {
    expect(rentalDays("2026-03-20", "2026-03-22")).toBe(3); // Nowruz
    expect(rentalDays("2026-12-30", "2027-01-02")).toBe(4);
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("diffDays is signed", () => {
    expect(diffDays("2026-10-10", "2026-10-08")).toBe(-2);
  });
  it("validates iso dates strictly", () => {
    expect(isIsoDate("2026-10-08")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-1-8")).toBe(false);
    expect(() => rentalDays("nope", "2026-10-08")).toThrow();
  });
  it("overlaps is inclusive", () => {
    expect(overlaps("2026-10-01", "2026-10-03", "2026-10-03", "2026-10-05")).toBe(true);
    expect(overlaps("2026-10-01", "2026-10-02", "2026-10-03", "2026-10-05")).toBe(false);
  });
  it("eachDay lists every day", () => {
    expect(eachDay("2026-10-30", "2026-11-02")).toEqual(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
  });
  it("todayInTehran uses Tehran calendar day", () => {
    // 22:00 UTC is already the next day in Tehran (UTC+3:30)
    expect(todayInTehran(new Date("2026-10-08T22:00:00Z"))).toBe("2026-10-09");
    expect(todayInTehran(new Date("2026-10-08T10:00:00Z"))).toBe("2026-10-08");
  });
});
