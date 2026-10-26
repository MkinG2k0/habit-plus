import { describe, expect, it } from "vitest";
import { makeHabit } from "@/test/habitFixtures";
import { isHabitArchived } from "./isHabitArchived";

describe("isHabitArchived", () => {
  it("is false without archivedAt", () => {
    expect(isHabitArchived(makeHabit({ id: 1, name: "A" }))).toBe(false);
  });

  it("is true when archivedAt is set", () => {
    expect(
      isHabitArchived(
        makeHabit({ id: 1, name: "A", archivedAt: "2026-01-01T00:00:00.000Z" }),
      ),
    ).toBe(true);
  });
});
