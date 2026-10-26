import { describe, expect, it } from "vitest";
import {
  addUtcDays,
  formatMonthYearRu,
  getHabitHeatmapUtcRange,
  getIsoDayKeyUtc,
  parseIsoDayKeyUtc,
  startOfUtcWeekMonday,
} from "./habitDates";

describe("UTC date helpers", () => {
  it("formats and parses ISO day keys", () => {
    const d = new Date(Date.UTC(2026, 9, 26, 15, 0, 0));
    expect(getIsoDayKeyUtc(d)).toBe("2026-10-26");
    const parsed = parseIsoDayKeyUtc("2026-10-26");
    expect(parsed.getUTCFullYear()).toBe(2026);
    expect(parsed.getUTCMonth()).toBe(9);
    expect(parsed.getUTCDate()).toBe(26);
  });

  it("adds UTC days and finds Monday", () => {
    const base = parseIsoDayKeyUtc("2026-10-26"); // Monday
    expect(getIsoDayKeyUtc(addUtcDays(base, 1))).toBe("2026-10-27");
    const sunday = parseIsoDayKeyUtc("2026-10-25");
    expect(getIsoDayKeyUtc(startOfUtcWeekMonday(sunday))).toBe("2026-10-19");
  });

  it("formats month year in Russian", () => {
    expect(formatMonthYearRu(new Date(2026, 9, 1))).toBe("Окт 2026");
  });
});

describe("getHabitHeatmapUtcRange", () => {
  it("uses one-year window when no completions", () => {
    const { rangeStart, endDate, gridStartMonday } = getHabitHeatmapUtcRange({});
    expect(endDate.getTime()).toBeGreaterThan(rangeStart.getTime());
    expect(gridStartMonday.getUTCDay()).toBe(1);
  });

  it("extends to first completion when older than a year", () => {
    const { rangeStart } = getHabitHeatmapUtcRange({
      "2020-01-15": true,
      "2026-10-01": true,
    });
    expect(getIsoDayKeyUtc(rangeStart)).toBe("2020-01-15");
  });
});
