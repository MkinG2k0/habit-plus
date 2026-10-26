import { describe, expect, it } from "vitest";
import {
  completionDayFilled,
  getCompletionNumericValue,
} from "./habitCompletion";

describe("completionDayFilled", () => {
  it("treats undefined and false as empty", () => {
    expect(completionDayFilled(undefined)).toBe(false);
    expect(completionDayFilled(false)).toBe(false);
  });

  it("treats true and positive numbers as filled", () => {
    expect(completionDayFilled(true)).toBe(true);
    expect(completionDayFilled(1)).toBe(true);
    expect(completionDayFilled(2.5)).toBe(true);
  });

  it("treats zero and NaN as empty", () => {
    expect(completionDayFilled(0)).toBe(false);
    expect(completionDayFilled(Number.NaN)).toBe(false);
  });
});

describe("getCompletionNumericValue", () => {
  it("maps boolean and numbers", () => {
    expect(getCompletionNumericValue(true)).toBe(1);
    expect(getCompletionNumericValue(false)).toBe(0);
    expect(getCompletionNumericValue(undefined)).toBe(0);
    expect(getCompletionNumericValue(3)).toBe(3);
    expect(getCompletionNumericValue(-2)).toBe(0);
    expect(getCompletionNumericValue(Number.NaN)).toBe(0);
  });
});
