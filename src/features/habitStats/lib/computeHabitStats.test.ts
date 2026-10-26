import { describe, expect, it } from "vitest";
import { makeHabit } from "@/test/habitFixtures";
import {
  computeHabitStatsSummary,
  lastNLocalDateKeys,
} from "./computeHabitStats";

describe("lastNLocalDateKeys", () => {
  it("returns ascending local keys ending at reference date", () => {
    const keys = lastNLocalDateKeys(3, new Date(2026, 9, 26));
    expect(keys).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
  });
});

describe("computeHabitStatsSummary", () => {
  const today = new Date(2026, 9, 26);

  it("ignores archived habits and reports empty stats", () => {
    const summary = computeHabitStatsSummary(
      [
        makeHabit({
          id: 1,
          name: "Archived",
          archivedAt: "2026-01-01T00:00:00.000Z",
          completions: { "2026-10-26": true },
        }),
      ],
      today,
    );
    expect(summary.activeCount).toBe(0);
    expect(summary.doneToday).toBe(0);
    expect(summary.habits).toHaveLength(0);
    expect(summary.dayBars).toHaveLength(7);
  });

  it("aggregates active habits", () => {
    const habits = [
      makeHabit({
        id: 1,
        name: "Read",
        streakInterval: "daily",
        completions: {
          "2026-10-24": true,
          "2026-10-25": true,
          "2026-10-26": true,
        },
      }),
      makeHabit({
        id: 2,
        name: "Walk",
        streakInterval: "daily",
        completions: { "2026-10-25": true },
      }),
    ];
    const summary = computeHabitStatsSummary(habits, today);
    expect(summary.activeCount).toBe(2);
    expect(summary.doneToday).toBe(1);
    expect(summary.rateToday).toBe(50);
    expect(summary.bestStreak).toBe(3);
    expect(summary.totalFilledAllTime).toBe(4);
    expect(summary.habits[0]?.habit.name).toBe("Read");
  });
});
