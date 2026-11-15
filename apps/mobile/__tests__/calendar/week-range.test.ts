import { describe, expect, it } from "vitest";
import { getWeekDays } from "@/components/calendar/week-range";

describe("getWeekDays", () => {
  it("starts on Monday and ends Sunday", () => {
    const d = getWeekDays(new Date(2026, 10, 15)); // Sunday
    expect(d[0]).toBe("2026-11-09");
    expect(d[6]).toBe("2026-11-15");
  });
  it("shifts by weeks across month boundary", () => {
    expect(getWeekDays(new Date(2026, 10, 15), 1)[0]).toBe("2026-11-16");
    expect(getWeekDays(new Date(2026, 10, 15), -2)[0]).toBe("2026-10-26");
  });
});
