import { describe, expect, it } from "vitest";
import { makeHabit } from "@/test/habitFixtures";
import {
  buildHomeCategoryFilterChips,
  categoryFiltersEqual,
  habitMatchesCategoryFilter,
} from "./categoryFilter";

describe("habitMatchesCategoryFilter", () => {
  const habit = makeHabit({
    id: 1,
    name: "A",
    categoryTags: [{ type: "preset", id: "health" }],
  });

  it("matches null / preset / uncategorized / custom", () => {
    expect(habitMatchesCategoryFilter(habit, null)).toBe(true);
    expect(
      habitMatchesCategoryFilter(habit, { kind: "preset", id: "health" }),
    ).toBe(true);
    expect(
      habitMatchesCategoryFilter(habit, { kind: "preset", id: "career" }),
    ).toBe(false);
    expect(
      habitMatchesCategoryFilter(habit, { kind: "uncategorized" }),
    ).toBe(false);
    expect(
      habitMatchesCategoryFilter(makeHabit({ id: 2, name: "B" }), {
        kind: "uncategorized",
      }),
    ).toBe(true);
    expect(
      habitMatchesCategoryFilter(
        makeHabit({
          id: 3,
          name: "C",
          categoryTags: [
            { type: "custom", id: "c1", label: "X", iconName: "Sparkles" },
          ],
        }),
        { kind: "custom", id: "c1" },
      ),
    ).toBe(true);
  });
});

describe("categoryFiltersEqual", () => {
  it("compares filter values", () => {
    expect(categoryFiltersEqual(null, null)).toBe(true);
    expect(categoryFiltersEqual(null, { kind: "uncategorized" })).toBe(false);
    expect(
      categoryFiltersEqual(
        { kind: "preset", id: "health" },
        { kind: "preset", id: "health" },
      ),
    ).toBe(true);
    expect(
      categoryFiltersEqual(
        { kind: "custom", id: "a" },
        { kind: "custom", id: "b" },
      ),
    ).toBe(false);
  });
});

describe("buildHomeCategoryFilterChips", () => {
  it("includes all / uncategorized / used presets / customs", () => {
    const chips = buildHomeCategoryFilterChips([
      makeHabit({ id: 1, name: "A" }),
      makeHabit({
        id: 2,
        name: "B",
        categoryTags: [{ type: "preset", id: "health" }],
      }),
      makeHabit({
        id: 3,
        name: "C",
        categoryTags: [
          { type: "custom", id: "wb", label: "WB", iconName: "Sparkles" },
        ],
      }),
    ]);
    expect(chips[0]?.key).toBe("all");
    expect(chips.some((c) => c.key === "uncategorized")).toBe(true);
    expect(chips.some((c) => c.key === "preset:health")).toBe(true);
    expect(chips.some((c) => c.key === "custom:wb")).toBe(true);
  });
});
