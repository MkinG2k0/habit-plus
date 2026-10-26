import { describe, expect, it } from "vitest";
import { foregroundOnHabitColor } from "./habitColors";

describe("foregroundOnHabitColor", () => {
  it("returns dark text on light backgrounds", () => {
    expect(foregroundOnHabitColor("#facc15")).toBe("#0a0a0a");
    expect(foregroundOnHabitColor("#fff")).toBe("#0a0a0a");
  });

  it("returns light text on dark backgrounds", () => {
    expect(foregroundOnHabitColor("#ef4444")).toBe("#fafafa");
    expect(foregroundOnHabitColor("#3b82f6")).toBe("#fafafa");
  });

  it("falls back for invalid hex", () => {
    expect(foregroundOnHabitColor("not-a-color")).toBe("#fafafa");
    expect(foregroundOnHabitColor("#12")).toBe("#fafafa");
  });
});
