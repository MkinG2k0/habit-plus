import type { HabitPresetCategoryId } from "./habitPresetCategories";
import type { HabitCompletionValue } from "./habitCompletion";

/** Встроенные SVG-значки (до Lucide); сохраняются в данных как строка. */
export type HabitIconName =
  | "health"
  | "brain"
  | "book"
  | "sport"
  | "water"
  | "meditation"
  | "music"
  | "code";

/**
 * Значок привычки: legacy-ключ (`HabitIconName`), имя иконки Lucide из
 * `CATEGORY_PICKER_ICONS`, или `emoji:` + символ(ы).
 */
export type HabitIconId = string;

/** Готовая категория или пользовательская (название + значок из набора). */
export type HabitCategoryTag =
  | { type: "preset"; id: HabitPresetCategoryId }
  | { type: "custom"; id: string; label: string; iconName: string };

export interface Reminder {
  id: number;
  days: number[];
  time: string;
}

/** Интервал цели серии: как часто нужно отмечать, чтобы не прервать серию. */
export type HabitStreakInterval = "none" | "daily" | "weekly" | "monthly";

export interface Habit {
  id: number;
  name: string;
  desc: string;
  icon: HabitIconId;
  color: string;
  completions: Record<string, HabitCompletionValue>;
  /** Интервал подсчёта серии (ежедневно / раз в неделю / раз в месяц). */
  streakInterval?: HabitStreakInterval;
  /**
   * @deprecated Раньше — цель «N дней подряд». Заменено на `streakInterval`; в данных может остаться из старых версий.
   */
  streakGoal?: number;
  reminders?: Reminder[];
  /** @deprecated используйте categoryTags */
  category?: string;
  /** Выбранные категории (несколько готовых и/или свои). */
  categoryTags?: HabitCategoryTag[];
  trackingMode?: "step" | "custom";
  dailyGoal?: number;
}

export type ViewMode = "grid" | "list" | "cols";
