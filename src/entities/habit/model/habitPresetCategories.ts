export const HABIT_PRESET_CATEGORY_IDS = [
  "health",
  "art",
  "communication",
  "nutrition",
  "work",
  "study",
  "finance",
  "fitness",
  "other",
  "morning",
  "day",
  "evening",
] as const;

export type HabitPresetCategoryId = (typeof HABIT_PRESET_CATEGORY_IDS)[number];

export const HABIT_PRESET_CATEGORY_LABELS: Record<HabitPresetCategoryId, string> =
  {
    health: "Здоровье",
    art: "Искусство",
    communication: "Общение",
    nutrition: "Питание",
    work: "Работа",
    study: "Учеба",
    finance: "Финансы",
    fitness: "Фитнес",
    other: "Другое",
    morning: "Утро",
    day: "День",
    evening: "Вечер",
  };
