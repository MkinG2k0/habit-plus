import { describe, expect, it } from "vitest";
import { makeHabit } from "@/test/habitFixtures";
import {
  computeHabitStreak,
  formatLocalDateKey,
  mondayOfLocalWeekContaining,
} from "./computeHabitStreak";

describe("formatLocalDateKey", () => {
  it("formats YYYY-MM-DD from local date parts", () => {
    expect(formatLocalDateKey(new Date(2026, 9, 26))).toBe("2026-10-26");
    expect(formatLocalDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("mondayOfLocalWeekContaining", () => {
  it("returns Monday for a mid-week date", () => {
    // Sunday 2026-10-25 → Monday 2026-10-19
    const mon = mondayOfLocalWeekContaining(new Date(2026, 9, 25));
    expect(formatLocalDateKey(mon)).toBe("2026-10-19");
  });

  it("returns same day when already Monday", () => {
    const mon = mondayOfLocalWeekContaining(new Date(2026, 9, 26));
    expect(formatLocalDateKey(mon)).toBe("2026-10-26");
  });
});

describe("computeHabitStreak", () => {
  const today = new Date(2026, 9, 26);

  it("returns 0 when interval is none", () => {
    const habit = makeHabit({
      id: 1,
      name: "A",
      streakInterval: "none",
      completions: { "2026-10-26": true },
    });
    expect(computeHabitStreak(habit, today)).toBe(0);
  });

  it("counts consecutive daily days, allowing today empty", () => {
    const habit = makeHabit({
      id: 1,
      name: "A",
      streakInterval: "daily",
      completions: {
        "2026-10-24": true,
        "2026-10-25": true,
      },
    });
    expect(computeHabitStreak(habit, today)).toBe(2);
  });

  it("includes today when filled", () => {
    const habit = makeHabit({
      id: 1,
      name: "A",
      streakInterval: "daily",
      completions: {
        "2026-10-24": true,
        "2026-10-25": true,
        "2026-10-26": true,
      },
    });
    expect(computeHabitStreak(habit, today)).toBe(3);
  });

  it("breaks daily streak on a gap", () => {
    const habit = makeHabit({
      id: 1,
      name: "A",
      streakInterval: "daily",
      completions: {
        "2026-10-22": true,
        "2026-10-25": true,
      },
    });
    expect(computeHabitStreak(habit, today)).toBe(1);
  });

  it("counts weekly streak by weeks with any completion", () => {
    const habit = makeHabit({
      id: 1,
      name: "A",
      streakInterval: "weekly",
      completions: {
        "2026-10-20": true, // this week (Mon 26 → week starts Mon 26? wait Mon 26 is start)
        "2026-10-13": true, // previous week
      },
    });
    // today Mon 2026-10-26 → this week Mon 26; with no completion this week yet,
    // looks at previous week starting Mon 19 — only Oct 20 is in week of 19? Oct 20 is Tue of week Mon 19.
    // Week of Mon 12 has Oct 13. So streak should be at least 1 (prev week) if current empty.
    // Current week Mon 26 has no completion → start from week Mon 19 → has Oct 20 → streak 1
    // Then week Mon 12 has Oct 13 → streak 2
    expect(computeHabitStreak(habit, today)).toBe(2);
  });

  it("counts monthly streak", () => {
    const habit = makeHabit({
      id: 1,
      name: "A",
      streakInterval: "monthly",
      completions: {
        "2026-10-01": true,
        "2026-09-15": true,
      },
    });
    expect(computeHabitStreak(habit, today)).toBe(2);
  });
});
