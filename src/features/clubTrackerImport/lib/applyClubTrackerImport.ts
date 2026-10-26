import {
  DEFAULT_HABIT_COLOR,
  useHabitCategoryCatalogStore,
  useHabitStore,
  type Habit,
  type HabitCategoryTag,
} from "@/entities/habit";
import { resolveClubCategory } from "./resolveClubCategory";
import type {
  ClubTrackerApplyResult,
  ClubTrackerParseResult,
} from "./types";

function habitMatchKey(name: string): string {
  return name.trim().toLowerCase();
}

function buildCategoryTag(
  categoryLabel: string | null,
  customIdsByLabel: Map<string, string>,
): { tags: HabitCategoryTag[] | undefined; color: string; icon: string } {
  const resolved = resolveClubCategory(categoryLabel);
  if (!resolved) {
    return { tags: undefined, color: DEFAULT_HABIT_COLOR, icon: "Sparkles" };
  }
  if (resolved.kind === "preset") {
    return {
      tags: [resolved.tag],
      color: resolved.color,
      icon: resolved.icon,
    };
  }

  const key = resolved.label.toLowerCase();
  let id = customIdsByLabel.get(key);
  if (!id) {
    id = crypto.randomUUID();
    customIdsByLabel.set(key, id);
    useHabitCategoryCatalogStore.getState().addUserCategory({
      id,
      label: resolved.label,
      iconName: resolved.icon,
    });
  }

  const tag: HabitCategoryTag = {
    type: "custom",
    id,
    label: resolved.label,
    iconName: resolved.icon,
  };
  return { tags: [tag], color: resolved.color, icon: resolved.icon };
}

/**
 * Создаёт отсутствующие привычки и проставляет галочки из трекера клуба.
 * Существующие отметки не снимает — только добавляет true из файла.
 */
export function applyClubTrackerImport(
  parsed: ClubTrackerParseResult,
): ClubTrackerApplyResult {
  const customIdsByLabel = new Map<string, string>();

  for (const item of useHabitCategoryCatalogStore.getState().items) {
    if (item.kind !== "user") continue;
    customIdsByLabel.set(item.label.trim().toLowerCase(), item.id);
  }

  let created = 0;
  let updated = 0;
  let checkedDays = 0;
  let skippedEmpty = 0;

  const habits = [...useHabitStore.getState().habits];
  const indexByName = new Map<string, number>();
  habits.forEach((h, i) => indexByName.set(habitMatchKey(h.name), i));

  const baseId = habits.reduce((max, h) => Math.max(max, h.id), Date.now());

  for (const row of parsed.habits) {
    const name = row.name.trim();
    if (!name) {
      skippedEmpty += 1;
      continue;
    }

    const key = habitMatchKey(name);
    const completionEntries = Object.entries(row.completions);
    checkedDays += completionEntries.length;

    const existingIdx = indexByName.get(key);
    if (existingIdx === undefined) {
      const meta = buildCategoryTag(row.categoryLabel, customIdsByLabel);
      const completions: Habit["completions"] = {};
      for (const [dateKey] of completionEntries) {
        completions[dateKey] = true;
      }
      const next: Habit = {
        id: baseId + created + 1,
        name,
        desc: "",
        icon: meta.icon,
        color: meta.color,
        completions,
        categoryTags: meta.tags,
        streakInterval: "daily",
        trackingMode: "step",
      };
      indexByName.set(key, habits.length);
      habits.push(next);
      created += 1;
      continue;
    }

    const existing = habits[existingIdx]!;
    const completions = { ...existing.completions };
    let changed = false;
    for (const [dateKey] of completionEntries) {
      if (completions[dateKey] !== true) {
        completions[dateKey] = true;
        changed = true;
      }
    }

    let categoryTags = existing.categoryTags;
    if (!categoryTags?.length && row.categoryLabel) {
      const meta = buildCategoryTag(row.categoryLabel, customIdsByLabel);
      categoryTags = meta.tags;
      changed = true;
    }

    if (changed) {
      habits[existingIdx] = { ...existing, completions, categoryTags };
      updated += 1;
    }
  }

  useHabitStore.setState({ habits });

  return { created, updated, checkedDays, skippedEmpty };
}
