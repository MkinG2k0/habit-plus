import type { HabitCategoryTag } from "@/entities/habit";

/** Одна привычка из трекера клуба (агрегат по всем месяцам). */
export interface ClubTrackerHabitImport {
  name: string;
  categoryLabel: string | null;
  /** Ключи YYYY-MM-DD → true только для отмеченных дней. */
  completions: Record<string, true>;
}

export interface ClubTrackerParseResult {
  year: number;
  habits: ClubTrackerHabitImport[];
  /** Сколько отметок (true) во всём файле. */
  checkedCount: number;
}

export interface ClubTrackerApplyResult {
  created: number;
  updated: number;
  checkedDays: number;
  skippedEmpty: number;
}

export type ClubCategoryResolved =
  | {
      kind: "preset";
      tag: Extract<HabitCategoryTag, { type: "preset" }>;
      color: string;
      icon: string;
    }
  | { kind: "custom"; label: string; color: string; icon: string };
