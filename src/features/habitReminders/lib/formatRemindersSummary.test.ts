import { describe, expect, it } from "vitest";
import { formatRemindersSummary } from "./formatRemindersSummary";

describe("formatRemindersSummary", () => {
  it("handles empty and plural forms", () => {
    expect(formatRemindersSummary(undefined)).toBe("Нет");
    expect(formatRemindersSummary([])).toBe("Нет");
    expect(formatRemindersSummary([{ id: 1, days: [0], time: "10:00" }])).toBe(
      "1 активное",
    );
    expect(
      formatRemindersSummary([
        { id: 1, days: [0], time: "10:00" },
        { id: 2, days: [1], time: "11:00" },
      ]),
    ).toBe("2 активных");
    expect(
      formatRemindersSummary(
        Array.from({ length: 11 }, (_, i) => ({
          id: i,
          days: [0],
          time: "10:00",
        })),
      ),
    ).toBe("11 активных");
  });
});
