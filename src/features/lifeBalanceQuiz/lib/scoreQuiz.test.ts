import { describe, expect, it } from "vitest";
import type { LifeBalanceQuestion } from "../model/questions";
import { getWeakestSpheres, scoreQuiz } from "./scoreQuiz";

const questions: LifeBalanceQuestion[] = [
  {
    id: "h1",
    sphereId: "health",
    text: "q1",
    options: [
      { text: "a", points: 1 },
      { text: "b", points: 5 },
    ],
  },
  {
    id: "f1",
    sphereId: "family",
    text: "q2",
    options: [
      { text: "a", points: 0 },
      { text: "b", points: 4 },
    ],
  },
  {
    id: "c1",
    sphereId: "career",
    text: "q3",
    options: [
      { text: "a", points: 2 },
      { text: "b", points: 2 },
    ],
  },
];

describe("scoreQuiz", () => {
  it("scores answered spheres and sorts by ascending average", () => {
    const answers = new Map<string, number>([
      ["h1", 0], // 1/5 = 0.2
      ["f1", 1], // 4/4 = 1
      ["c1", 0], // 2/2 = 1
    ]);
    const scores = scoreQuiz(questions, answers);
    expect(scores.find((s) => s.sphereId === "health")?.attentionPercent).toBe(
      20,
    );
    expect(scores.find((s) => s.sphereId === "family")?.attentionPercent).toBe(
      100,
    );
    expect(scores.find((s) => s.sphereId === "career")?.attentionPercent).toBe(
      100,
    );

    const healthIdx = scores.findIndex((s) => s.sphereId === "health");
    const familyIdx = scores.findIndex((s) => s.sphereId === "family");
    expect(healthIdx).toBeGreaterThanOrEqual(0);
    expect(healthIdx).toBeLessThan(familyIdx);
  });

  it("handles missing answers as zero earned", () => {
    const scores = scoreQuiz(questions, new Map());
    const health = scores.find((s) => s.sphereId === "health");
    expect(health?.average).toBe(0);
    expect(health?.attentionPercent).toBe(0);
  });
});

describe("getWeakestSpheres", () => {
  it("returns first N sphere ids from sorted scores", () => {
    const scores = [
      { sphereId: "health" as const, average: 0.1, attentionPercent: 10 },
      { sphereId: "family" as const, average: 0.5, attentionPercent: 50 },
      { sphereId: "career" as const, average: 0.9, attentionPercent: 90 },
    ];
    expect(getWeakestSpheres(scores, 2)).toEqual(["health", "family"]);
  });
});
