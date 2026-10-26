import { describe, expect, it } from "vitest";
import { makeHabit } from "@/test/habitFixtures";
import { collectReminderJobs } from "./collectReminderJobs";

describe("collectReminderJobs", () => {
  it("skips archived habits and empty reminders", () => {
    const from = new Date(2026, 9, 26, 8, 0, 0, 0);
    const jobs = collectReminderJobs(
      [
        makeHabit({
          id: 1,
          name: "Archived",
          archivedAt: "2026-01-01T00:00:00.000Z",
          reminders: [{ id: 10, days: [0, 1, 2, 3, 4], time: "10:00" }],
        }),
        makeHabit({ id: 2, name: "No reminders", reminders: [] }),
      ],
      from,
      7,
    );
    expect(jobs).toEqual([]);
  });

  it("collects jobs for active habits in horizon", () => {
    const from = new Date(2026, 9, 26, 8, 0, 0, 0);
    const jobs = collectReminderJobs(
      [
        makeHabit({
          id: 3,
          name: "Read",
          reminders: [{ id: 11, days: [0], time: "10:00" }],
        }),
      ],
      from,
      14,
    );
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((j) => j.habitId === 3 && j.title === "Read")).toBe(true);
    expect(jobs.every((j) => j.at.getTime() > from.getTime())).toBe(true);
  });
});
