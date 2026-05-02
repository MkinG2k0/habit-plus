import {
  HABIT_PRESET_CATEGORY_LABELS,
  type HabitCategoryTag,
  type HabitPresetCategoryId,
} from "@/entities/habit";

export const formatCategoryTagsSummary = (
  tags: HabitCategoryTag[] | undefined,
): string => {
  if (!tags?.length) return "Нет";
  const labels = tags.map((t) => {
    if (t.type === "preset") {
      return HABIT_PRESET_CATEGORY_LABELS[t.id as HabitPresetCategoryId];
    }
    return t.label.trim() || "Своя";
  });
  if (labels.length <= 2) return labels.join(", ");
  return `${labels.slice(0, 2).join(", ")} +${String(labels.length - 2)}`;
};

export const isPresetSelected = (
  tags: HabitCategoryTag[],
  id: HabitPresetCategoryId,
) => tags.some((t) => t.type === "preset" && t.id === id);

export const togglePresetInTags = (
  tags: HabitCategoryTag[],
  id: HabitPresetCategoryId,
): HabitCategoryTag[] => {
  const has = tags.some((t) => t.type === "preset" && t.id === id);
  if (has) {
    return tags.filter((t) => !(t.type === "preset" && t.id === id));
  }
  return [...tags, { type: "preset", id }];
};
