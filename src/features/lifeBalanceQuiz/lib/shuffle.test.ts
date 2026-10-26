import { describe, expect, it, vi } from "vitest";
import { shuffleArray } from "./shuffle";

describe("shuffleArray", () => {
  it("returns a new array with the same elements", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const input = [1, 2, 3, 4];
    const out = shuffleArray(input);
    expect(out).not.toBe(input);
    expect(out.sort()).toEqual([1, 2, 3, 4]);
    vi.restoreAllMocks();
  });
});
