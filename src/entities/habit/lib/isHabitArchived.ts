import type { Habit } from "../model/types";

/** Привычка в архиве (скрыта с главного экрана, статистика сохранена). */
export function isHabitArchived(habit: Habit): boolean {
  return Boolean(habit.archivedAt);
}
