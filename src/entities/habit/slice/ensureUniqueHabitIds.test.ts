import { describe, expect, it } from "vitest";
import { makeHabit } from "@/test/habitFixtures";
import { ensureUniqueHabitIds } from "./habitStore";

describe("ensureUniqueHabitIds", () => {
  it("returns same array reference when ids are unique", () => {
    const habits = [
      makeHabit({ id: 1, name: "A" }),
      makeHabit({ id: 2, name: "B" }),
    ];
    expect(ensureUniqueHabitIds(habits)).toBe(habits);
  });

  it("rewrites duplicate ids", () => {
    const habits = [
      makeHabit({ id: 10, name: "A" }),
      makeHabit({ id: 10, name: "B" }),
      makeHabit({ id: 11, name: "C" }),
    ];
    const fixed = ensureUniqueHabitIds(habits);
    const ids = fixed.map((h) => h.id);
    expect(new Set(ids).size).toBe(3);
    expect(fixed[0]?.id).toBe(10);
    expect(fixed[1]?.id).not.toBe(10);
    expect(fixed[2]?.id).toBe(11);
  });
});
