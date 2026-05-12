import { parseDateOnlyToUtcNoon, startOfUtcDate } from "@/lib/dates";

describe("lib/dates", () => {
  describe("parseDateOnlyToUtcNoon", () => {
    test("parses YYYY-MM-DD to UTC noon", () => {
      const d = parseDateOnlyToUtcNoon("2024-06-15");
      expect(d.getUTCHours()).toBe(12);
      expect(d.getUTCMinutes()).toBe(0);
      expect(d.getUTCDate()).toBe(15);
      expect(d.getUTCMonth()).toBe(5);
      expect(d.getUTCFullYear()).toBe(2024);
    });

    test("falls back for non-matching string via Date constructor", () => {
      const d = parseDateOnlyToUtcNoon("not-a-date");
      expect(d).toBeInstanceOf(Date);
    });

    test("invalid date strings may produce Invalid Date", () => {
      const d = parseDateOnlyToUtcNoon("not-a-date");
      expect(Number.isNaN(d.getTime())).toBe(true);
    });
  });

  describe("startOfUtcDate", () => {
    test("zeros time in UTC for calendar components", () => {
      const src = new Date(Date.UTC(2024, 5, 20, 18, 30, 45));
      const d = startOfUtcDate(src);
      expect(d.getUTCHours()).toBe(0);
      expect(d.getUTCMinutes()).toBe(0);
      expect(d.getUTCSeconds()).toBe(0);
      expect(d.getUTCDate()).toBe(src.getUTCDate());
    });
  });
});
