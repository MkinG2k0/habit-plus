import { describe, expect, it } from "vitest";
import { resolveClubCategory } from "./resolveClubCategory";

describe("resolveClubCategory", () => {
  it("returns null for empty labels", () => {
    expect(resolveClubCategory(null)).toBeNull();
    expect(resolveClubCategory("")).toBeNull();
    expect(resolveClubCategory("   ")).toBeNull();
  });

  it("maps preset labels and synonyms", () => {
    const health = resolveClubCategory("Здоровье");
    expect(health?.kind).toBe("preset");
    if (health?.kind === "preset") {
      expect(health.tag.id).toBe("health");
    }

    const work = resolveClubCategory("Бизнес");
    expect(work?.kind).toBe("preset");
    if (work?.kind === "preset") {
      expect(work.tag.id).toBe("work");
    }
  });

  it("falls back to custom category", () => {
    const custom = resolveClubCategory("WB");
    expect(custom).toEqual({
      kind: "custom",
      label: "WB",
      color: "#6366f1",
      icon: "Sparkles",
    });
  });
});
