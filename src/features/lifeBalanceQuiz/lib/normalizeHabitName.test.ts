import { describe, expect, it } from "vitest";
import { normalizeHabitName } from "./normalizeHabitName";

describe("normalizeHabitName", () => {
  it("trims and lowercases", () => {
    expect(normalizeHabitName("  Глава Книги  ")).toBe("глава книги");
  });
});
