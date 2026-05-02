import type { Habit } from "@/entities/habit";
import {
  HABIT_PRESET_CATEGORY_IDS,
  HABIT_PRESET_CATEGORY_LABELS,
  type HabitPresetCategoryId,
} from "@/entities/habit";

/** null — показать все привычки. */
export type HabitCategoryFilter =
  | null
  | { kind: "uncategorized" }
  | { kind: "preset"; id: HabitPresetCategoryId }
  | { kind: "custom"; id: string };

export const habitMatchesCategoryFilter = (
  habit: Habit,
  filter: HabitCategoryFilter,
): boolean => {
  if (filter === null) return true;
  const tags = habit.categoryTags ?? [];
  if (filter.kind === "uncategorized") return tags.length === 0;
  if (filter.kind === "preset") {
    return tags.some((t) => t.type === "preset" && t.id === filter.id);
  }
  return tags.some((t) => t.type === "custom" && t.id === filter.id);
};

export const categoryFiltersEqual = (
  a: HabitCategoryFilter,
  b: HabitCategoryFilter,
): boolean => {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  if (a.kind !== b.kind) return false;
  if (a.kind === "uncategorized") return true;
  if (a.kind === "preset") return b.kind === "preset" && a.id === b.id;
  return b.kind === "custom" && a.id === b.id;
};

export type HomeCategoryFilterChip =
  | { key: "all"; label: string; filter: null }
  | { key: "uncategorized"; label: string; filter: { kind: "uncategorized" } }
  | { key: `preset:${string}`; label: string; filter: { kind: "preset"; id: HabitPresetCategoryId } }
  | { key: `custom:${string}`; label: string; filter: { kind: "custom"; id: string } };

export const buildHomeCategoryFilterChips = (
  habits: Habit[],
): HomeCategoryFilterChip[] => {
  const chips: HomeCategoryFilterChip[] = [
    { key: "all", label: "Все", filter: null },
  ];

  let hasUncategorized = false;
  const presetSeen = new Set<HabitPresetCategoryId>();
  const customs = new Map<string, string>();

  for (const h of habits) {
    const tags = h.categoryTags ?? [];
    if (tags.length === 0) hasUncategorized = true;
    for (const t of tags) {
      if (t.type === "preset") presetSeen.add(t.id);
      else customs.set(t.id, t.label);
    }
  }

  if (hasUncategorized) {
    chips.push({
      key: "uncategorized",
      label: "Без категории",
      filter: { kind: "uncategorized" },
    });
  }

  for (const id of HABIT_PRESET_CATEGORY_IDS) {
    if (presetSeen.has(id)) {
      chips.push({
        key: `preset:${id}`,
        label: HABIT_PRESET_CATEGORY_LABELS[id],
        filter: { kind: "preset", id },
      });
    }
  }

  const customSorted = [...customs.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], "ru"),
  );
  for (const [id, label] of customSorted) {
    chips.push({
      key: `custom:${id}`,
      label: label.trim() || "Своя",
      filter: { kind: "custom", id },
    });
  }

  return chips;
};
