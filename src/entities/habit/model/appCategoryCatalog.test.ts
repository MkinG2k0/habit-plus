import { describe, expect, it } from "vitest";
import {
  buildDefaultHabitCategoryCatalog,
  isPresetCategoryId,
  normalizeCatalogItems,
} from "./appCategoryCatalog";

describe("isPresetCategoryId", () => {
  it("recognizes known presets", () => {
    expect(isPresetCategoryId("health")).toBe(true);
    expect(isPresetCategoryId("not-a-preset")).toBe(false);
  });
});

describe("buildDefaultHabitCategoryCatalog", () => {
  it("builds default entries for all presets", () => {
    const catalog = buildDefaultHabitCategoryCatalog();
    expect(catalog.length).toBeGreaterThan(5);
    expect(catalog.every((e) => e.kind === "default")).toBe(true);
    expect(catalog.some((e) => e.id === "health")).toBe(true);
  });
});

describe("normalizeCatalogItems", () => {
  it("falls back to defaults when empty", () => {
    const normalized = normalizeCatalogItems(undefined);
    expect(normalized.some((e) => e.id === "family")).toBe(true);
  });

  it("keeps user categories after builtins", () => {
    const normalized = normalizeCatalogItems([
      ...buildDefaultHabitCategoryCatalog(),
      {
        id: "custom-wb",
        kind: "user",
        label: "WB",
        iconName: "Sparkles",
      },
      {
        id: "custom-wb",
        kind: "user",
        label: "Dup",
        iconName: "Sparkles",
      },
    ]);
    const users = normalized.filter((e) => e.kind === "user");
    expect(users).toHaveLength(1);
    expect(users[0]?.label).toBe("WB");
  });

  it("ignores user rows without iconName", () => {
    const normalized = normalizeCatalogItems([
      { id: "x", kind: "user", label: "X" },
    ]);
    expect(normalized.every((e) => e.kind === "default")).toBe(true);
  });
});
