import { describe, expect, it } from "vitest";
import {
  HABIT_REMINDER_TAG_PREFIX,
  habitReminderNotificationId,
  habitReminderTag,
} from "./notificationIds";

describe("habitReminderNotificationId", () => {
  it("returns stable positive 31-bit ids", () => {
    const a = habitReminderNotificationId(1, 2, 1_700_000_000_000);
    const b = habitReminderNotificationId(1, 2, 1_700_000_000_000);
    const c = habitReminderNotificationId(1, 2, 1_700_000_000_000 + 86_400_000);
    expect(a).toBe(b);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThanOrEqual(0x7fffffff);
    expect(a).not.toBe(c);
  });
});

describe("habitReminderTag", () => {
  it("builds a prefixed tag", () => {
    expect(habitReminderTag(5, 9, 123)).toBe(
      `${HABIT_REMINDER_TAG_PREFIX}5:9:123`,
    );
  });
});
