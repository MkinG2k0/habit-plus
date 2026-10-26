import { describe, expect, it } from "vitest";
import { makeHabit } from "@/test/habitFixtures";
import type { SphereScore } from "./scoreQuiz";
import {
  recommendTemplates,
  replaceRecommendedTemplate,
} from "./recommendTemplates";

function scoresForWeak(
  weak: SphereScore["sphereId"][],
): SphereScore[] {
  const all: SphereScore["sphereId"][] = [
    "family",
    "health",
    "selfDevelopment",
    "career",
    "spirituality",
    "socialCircle",
    "leisure",
  ];
  return all.map((sphereId, i) => ({
    sphereId,
    average: weak.includes(sphereId) ? 0.1 + i * 0.01 : 0.9,
    attentionPercent: weak.includes(sphereId) ? 10 : 90,
  })).sort((a, b) => a.average - b.average);
}

describe("recommendTemplates", () => {
  it("recommends templates for weakest spheres", () => {
    const recs = recommendTemplates(scoresForWeak(["health", "leisure"]), []);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((t) => t.id && t.name)).toBe(true);
    const categories = new Set(recs.map((t) => t.categoryId));
    expect(categories.has("health") || categories.has("leisure")).toBe(true);
  });

  it("skips templates whose names already exist", () => {
    const firstPass = recommendTemplates(scoresForWeak(["health"]), []);
    expect(firstPass.length).toBeGreaterThan(0);
    const existing = firstPass.map((t, i) =>
      makeHabit({ id: i + 1, name: t.name }),
    );
    const second = recommendTemplates(scoresForWeak(["health"]), existing);
    const names = new Set(existing.map((h) => h.name.trim().toLowerCase()));
    expect(second.every((t) => !names.has(t.name.trim().toLowerCase()))).toBe(
      true,
    );
  });
});

describe("replaceRecommendedTemplate", () => {
  it("returns another template from the same sphere when available", () => {
    const recs = recommendTemplates(scoresForWeak(["health"]), [], 1);
    const current = recs[0];
    if (!current) return;
    const next = replaceRecommendedTemplate(current, recs, []);
    if (next) {
      expect(next.id).not.toBe(current.id);
      expect(next.categoryId).toBe(current.categoryId);
    }
  });
});
