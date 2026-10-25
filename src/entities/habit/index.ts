export type {
  Habit,
  HabitCategoryTag,
  HabitIconId,
  HabitIconName,
  HabitStreakInterval,
  Reminder,
  ViewMode,
} from "./model/types";
export type { HabitCompletionValue } from "./model/habitCompletion";
export {
  completionDayFilled,
  getCompletionNumericValue,
} from "./model/habitCompletion";
export type {
  AppCategoryCatalogEntry,
  AppCategoryCatalogKind,
} from "./model/appCategoryCatalog";
export {
  buildDefaultHabitCategoryCatalog,
  isPresetCategoryId,
  normalizeCatalogItems,
} from "./model/appCategoryCatalog";
export type { HabitPresetCategoryId } from "./model/habitPresetCategories";
export {
  HABIT_PRESET_CATEGORY_COLORS,
  HABIT_PRESET_CATEGORY_IDS,
  HABIT_PRESET_CATEGORY_LABELS,
} from "./model/habitPresetCategories";
export type {
  HabitTemplate,
  HabitTemplateCategoryId,
} from "./model/habitTemplates";
export {
  HABIT_TEMPLATES,
  HABIT_TEMPLATE_CATEGORY_IDS,
  getHabitTemplatesByCategory,
} from "./model/habitTemplates";
export {
  DEFAULT_HABIT_COLOR,
  foregroundOnHabitColor,
  HABIT_COLOR_OPTIONS,
} from "./model/habitColors";
export {
  computeHabitStreak,
  formatLocalDateKey,
} from "./lib/computeHabitStreak";
export { useHabitStore } from "./slice/habitStore";
export { useHabitCategoryCatalogStore } from "./slice/habitCategoryCatalogStore";
