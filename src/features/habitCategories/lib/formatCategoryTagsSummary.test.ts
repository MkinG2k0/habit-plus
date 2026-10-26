import { describe, expect, it } from "vitest";
import {
  formatCategoryTagsSummary,
  isPresetSelected,
  togglePresetInTags,
} from "./formatCategoryTagsSummary";

describe("formatCategoryTagsSummary", () => {
  it("formats empty, short, and long tag lists", () => {
    expect(formatCategoryTagsSummary(undefined)).toBe("Нет");
    expect(
      formatCategoryTagsSummary([{ type: "preset", id: "health" }]),
    ).not.toBe("Нет");
    expect(
      formatCategoryTagsSummary([
        { type: "preset", id: "health" },
        { type: "preset", id: "career" },
        { type: "preset", id: "family" },
      ]),
    ).toMatch(/\+1$/);
  });
});

describe("togglePresetInTags / isPresetSelected", () => {
  it("adds and removes presets", () => {
    const added = togglePresetInTags([], "health");
    expect(isPresetSelected(added, "health")).toBe(true);
    const removed = togglePresetInTags(added, "health");
    expect(isPresetSelected(removed, "health")).toBe(false);
  });
});
