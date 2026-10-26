import {
  HABIT_PRESET_CATEGORY_COLORS,
  HABIT_PRESET_CATEGORY_LABELS,
  type HabitPresetCategoryId,
} from "@/entities/habit";
import type { ClubCategoryResolved } from "./types";

const LABEL_TO_PRESET: Record<string, HabitPresetCategoryId> = Object.fromEntries(
  (
    Object.entries(HABIT_PRESET_CATEGORY_LABELS) as [
      HabitPresetCategoryId,
      string,
    ][]
  ).map(([id, label]) => [label.trim().toLowerCase(), id]),
);

/** Доп. синонимы секций из шаблона клуба. */
const EXTRA_LABEL_TO_PRESET: Record<string, HabitPresetCategoryId> = {
  бизнес: "work",
  работа: "work",
};

const CUSTOM_COLORS: Record<string, string> = {
  wb: "#6366f1",
};

const PRESET_ICONS: Record<HabitPresetCategoryId, string> = {
  family: "Heart",
  health: "Activity",
  selfDevelopment: "BookOpen",
  career: "Briefcase",
  spirituality: "Sparkles",
  socialCircle: "Heart",
  leisure: "Coffee",
  art: "Brush",
  communication: "MessageCircle",
  nutrition: "Apple",
  work: "Briefcase",
  study: "GraduationCap",
  finance: "Wallet",
  fitness: "Dumbbell",
  other: "Sparkles",
  morning: "Sun",
  day: "Sun",
  evening: "Moon",
};

export function resolveClubCategory(
  label: string | null,
): ClubCategoryResolved | null {
  if (!label) return null;
  const key = label.trim().toLowerCase();
  if (!key) return null;

  const presetId = LABEL_TO_PRESET[key] ?? EXTRA_LABEL_TO_PRESET[key];
  if (presetId) {
    return {
      kind: "preset",
      tag: { type: "preset", id: presetId },
      color: HABIT_PRESET_CATEGORY_COLORS[presetId],
      icon: PRESET_ICONS[presetId],
    };
  }

  return {
    kind: "custom",
    label: label.trim(),
    color: CUSTOM_COLORS[key] ?? "#6b7280",
    icon: "Sparkles",
  };
}

