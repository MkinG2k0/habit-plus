import type { HabitHeatmapWindow } from "@/shared/lib/habitDates";

export type HabitShareRangeId =
  | "week"
  | "month"
  | "months3"
  | "months6"
  | "year"
  | "all";

export const DEFAULT_HABIT_SHARE_RANGE: HabitShareRangeId = "month";

export const HABIT_SHARE_RANGE_OPTIONS: {
  id: HabitShareRangeId;
  label: string;
}[] = [
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "months3", label: "3 месяца" },
  { id: "months6", label: "Полгода" },
  { id: "year", label: "Год" },
  { id: "all", label: "Всё время" },
];

export function habitShareRangeToHeatmapWindow(
  range: HabitShareRangeId,
): HabitHeatmapWindow {
  switch (range) {
    case "week":
      return { mode: "calendarWeek" };
    case "month":
      return { mode: "days", days: 30 };
    case "months3":
      return { mode: "days", days: 90 };
    case "months6":
      return { mode: "days", days: 182 };
    case "year":
      return { mode: "days", days: 365 };
    case "all":
      return { mode: "all" };
  }
}
