import { computeInsights } from "@/lib/insights";

describe("computeInsights", () => {
  test("US-RIDE-002 baseline: zero rides returns defaults", () => {
    const r = computeInsights([]);
    expect(r.rideFrequency).toBe("No rides yet");
    expect(r.averageFare).toBe(0);
    expect(r.totalSpent).toBe(0);
    expect(r.regularityLabel).toBe("New");
    expect(r.totalRides).toBe(0);
  });

  test("one ride: frequency string, totals, New regularity", () => {
    const r = computeInsights([{ fare: 25, date: "2024-06-01T12:00:00.000Z" }]);
    expect(r.rideFrequency).toBe("1 ride");
    expect(r.averageFare).toBe(25);
    expect(r.totalSpent).toBe(25);
    expect(r.regularityLabel).toBe("New");
    expect(r.totalRides).toBe(1);
  });

  test("two rides: still New regularity per rules", () => {
    const r = computeInsights([
      { fare: 10, date: "2024-01-01T12:00:00.000Z" },
      { fare: 20, date: "2024-01-08T12:00:00.000Z" },
    ]);
    expect(r.totalRides).toBe(2);
    expect(r.regularityLabel).toBe("New");
    expect(r.totalSpent).toBe(30);
    expect(r.averageFare).toBe(15);
  });

  test("multiple rides: frequency uses span in weeks", () => {
    const r = computeInsights([
      { fare: 12, date: "2024-01-01T12:00:00.000Z" },
      { fare: 12, date: "2024-01-08T12:00:00.000Z" },
      { fare: 12, date: "2024-01-15T12:00:00.000Z" },
    ]);
    expect(r.totalRides).toBe(3);
    expect(r.totalSpent).toBeCloseTo(36, 5);
    expect(r.averageFare).toBeCloseTo(12, 5);
    expect(r.rideFrequency).toMatch(/\/(week|month)/);
  });

  test("Very Regular when ridesPerWeek >= 2", () => {
    const same = new Date("2024-03-01T12:00:00.000Z");
    const rides = [10, 10, 10, 10].map((fare) => ({ fare, date: same }));
    const r = computeInsights(rides);
    expect(r.regularityLabel).toBe("Very Regular");
  });

  test("Regular when ridesPerWeek >= 1 and < 2 and ride count > 2", () => {
    const r = computeInsights([
      { fare: 10, date: "2024-01-01T12:00:00.000Z" },
      { fare: 10, date: "2024-01-08T12:00:00.000Z" },
      { fare: 10, date: "2024-01-15T12:00:00.000Z" },
    ]);
    expect(r.regularityLabel).toBe("Regular");
  });

  test("Occasional when ridesPerWeek < 1 and ride count > 2", () => {
    const r = computeInsights([
      { fare: 5, date: "2024-01-01T12:00:00.000Z" },
      { fare: 5, date: "2024-02-01T12:00:00.000Z" },
      { fare: 5, date: "2024-03-01T12:00:00.000Z" },
    ]);
    expect(r.regularityLabel).toBe("Occasional");
  });
});
