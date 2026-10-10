import { parseDuration } from "./duration";

describe("parseDuration", () => {
  it("parses the TTL strings used for tokens", () => {
    expect(parseDuration("15m", 0)).toBe(900);
    expect(parseDuration("7d", 0)).toBe(604_800);
    expect(parseDuration("30s", 0)).toBe(30);
    expect(parseDuration("2h", 0)).toBe(7200);
  });

  it("treats a bare number as seconds", () => {
    expect(parseDuration("3600", 0)).toBe(3600);
  });

  it("falls back when the value is missing or malformed", () => {
    expect(parseDuration("", 900)).toBe(900);
    expect(parseDuration("forever", 900)).toBe(900);
    expect(parseDuration("-5m", 900)).toBe(900);
  });
});
