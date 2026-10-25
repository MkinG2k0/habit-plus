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
