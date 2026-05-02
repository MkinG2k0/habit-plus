import type { HabitPresetCategoryId } from "./habitPresetCategories";

export type HabitIconName =
  | "health"
  | "brain"
  | "book"
  | "sport"
  | "water"
  | "meditation"
  | "music"
  | "code";

/** Готовая категория или пользовательская (название + значок из набора). */
export type HabitCategoryTag =
  | { type: "preset"; id: HabitPresetCategoryId }
  | { type: "custom"; id: string; label: string; iconName: string };

export interface Reminder {
  id: number;
  days: number[];
  time: string;
}

export interface Habit {
  id: number;
  name: string;
  desc: string;
  icon: HabitIconName;
  color: string;
  completions: Record<string, boolean>;
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
