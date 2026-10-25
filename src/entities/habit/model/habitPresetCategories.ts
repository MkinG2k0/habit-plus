export const HABIT_PRESET_CATEGORY_IDS = [
  "family",
  "health",
  "selfDevelopment",
  "career",
  "spirituality",
  "socialCircle",
  "leisure",
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
    family: "Семья",
    health: "Здоровье",
    selfDevelopment: "Саморазвитие",
    career: "Карьера",
    spirituality: "Духовность",
    socialCircle: "Окружение",
    leisure: "Отдых",
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

/** Акцентный цвет категории (из палитры привычек). */
export const HABIT_PRESET_CATEGORY_COLORS: Record<
  HabitPresetCategoryId,
  string
> = {
  family: "#f43f5e",
  health: "#22c55e",
  selfDevelopment: "#8b5cf6",
  career: "#3b82f6",
  spirituality: "#a855f7",
  socialCircle: "#14b8a6",
  leisure: "#f97316",
  art: "#ec4899",
  communication: "#06b6d4",
  nutrition: "#84cc16",
  work: "#6366f1",
  study: "#eab308",
  finance: "#10b981",
  fitness: "#ef4444",
  other: "#6b7280",
  morning: "#06b6d4",
  day: "#eab308",
  evening: "#6366f1",
};
