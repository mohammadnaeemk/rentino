import { nightsBetween, parseCalendarDate, toDateOnly } from "./dates";

describe("calendar dates (rental end date is exclusive)", () => {
  it("parses YYYY-MM-DD to UTC midnight", () => {
    const date = parseCalendarDate("2026-03-21");
    expect(date?.toISOString()).toBe("2026-03-21T00:00:00.000Z");
  });

  it("rejects unparseable input", () => {
    expect(parseCalendarDate("not-a-date")).toBeNull();
    expect(parseCalendarDate("")).toBeNull();
  });

  it("counts whole rental days", () => {
    const start = parseCalendarDate("2026-03-21")!;
    const end = parseCalendarDate("2026-03-24")!;
    expect(nightsBetween(start, end)).toBe(3);
  });

  it("treats a same-day return as zero days (rejected by the service)", () => {
    const start = parseCalendarDate("2026-03-21")!;
    expect(nightsBetween(start, start)).toBe(0);
  });

  it("round-trips through toDateOnly", () => {
    expect(toDateOnly(parseCalendarDate("2026-01-02")!)).toBe("2026-01-02");
  });
});
