import { describe, expect, it } from "vitest";
import { formatStreakGoalSummary } from "./formatStreakGoalSummary";

describe("formatStreakGoalSummary", () => {
  it("maps intervals to Russian labels", () => {
    expect(formatStreakGoalSummary(undefined)).toBe("Нет");
    expect(formatStreakGoalSummary("none")).toBe("Нет");
    expect(formatStreakGoalSummary("daily")).toBe("Ежедневно");
    expect(formatStreakGoalSummary("weekly")).toBe("Неделя");
    expect(formatStreakGoalSummary("monthly")).toBe("Месяц");
  });
});
