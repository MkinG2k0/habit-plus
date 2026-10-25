import type { HabitStreakInterval } from "@/entities/habit";

/** Подпись интервала цели серии в настройках привычки. */
export function formatStreakGoalSummary(
  interval: HabitStreakInterval | undefined,
): string {
  switch (interval ?? "none") {
    case "daily":
      return "Ежедневно";
    case "weekly":
      return "Неделя";
    case "monthly":
      return "Месяц";
    default:
      return "Нет";
  }
}
