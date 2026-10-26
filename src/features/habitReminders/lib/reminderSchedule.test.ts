import { describe, expect, it } from "vitest";
import {
  jsWeekdayToReminderDay,
  nextReminderFireAt,
  parseReminderTime,
} from "./reminderSchedule";

describe("jsWeekdayToReminderDay", () => {
  it("maps JS Sunday=0 to reminder Sunday=6", () => {
    expect(jsWeekdayToReminderDay(0)).toBe(6);
    expect(jsWeekdayToReminderDay(1)).toBe(0); // Monday
    expect(jsWeekdayToReminderDay(6)).toBe(5); // Saturday
  });
});

describe("parseReminderTime", () => {
  it("parses valid HH:MM", () => {
    expect(parseReminderTime("09:30")).toEqual({ hours: 9, minutes: 30 });
    expect(parseReminderTime("23:59")).toEqual({ hours: 23, minutes: 59 });
  });

  it("rejects invalid times", () => {
    expect(parseReminderTime("")).toBeNull();
    expect(parseReminderTime("25:00")).toBeNull();
    expect(parseReminderTime("10:60")).toBeNull();
    expect(parseReminderTime("10")).toBeNull();
  });
});

describe("nextReminderFireAt", () => {
  it("returns null without days or with bad time", () => {
    expect(
      nextReminderFireAt({ id: 1, days: [], time: "10:00" }, new Date()),
    ).toBeNull();
    expect(
      nextReminderFireAt({ id: 1, days: [0], time: "bad" }, new Date()),
    ).toBeNull();
  });

  it("picks the next matching weekday in the future", () => {
    // Monday 2026-10-26 09:00 local
    const from = new Date(2026, 9, 26, 9, 0, 0, 0);
    const next = nextReminderFireAt(
      { id: 1, days: [0], time: "10:00" }, // Monday
      from,
    );
    expect(next).not.toBeNull();
    expect(next!.getFullYear()).toBe(2026);
    expect(next!.getMonth()).toBe(9);
    expect(next!.getDate()).toBe(26);
    expect(next!.getHours()).toBe(10);
  });

  it("skips today's slot if already past", () => {
    const from = new Date(2026, 9, 26, 11, 0, 0, 0);
    const next = nextReminderFireAt(
      { id: 1, days: [0], time: "10:00" },
      from,
    );
    expect(next).not.toBeNull();
    expect(next!.getDate()).toBe(2); // next Monday Nov 2
    expect(next!.getMonth()).toBe(10);
  });
});
