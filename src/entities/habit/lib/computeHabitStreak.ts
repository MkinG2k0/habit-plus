import { completionDayFilled } from "../model/habitCompletion";
import type { Habit, HabitStreakInterval } from "../model/types";

/** Локальная дата YYYY-MM-DD (как ключи в completions). */
export function formatLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addLocalDays(base: Date, delta: number): Date {
  const x = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  x.setDate(x.getDate() + delta);
  return x;
}

/** Понедельник недели, в которой лежит `d` (Пн–Вс). */
export function mondayOfLocalWeekContaining(d: Date): Date {
  const x = startOfLocalDay(d);
  const mon0 = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - mon0);
  return x;
}

function startOfLocalMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addLocalMonths(base: Date, delta: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

function isDayDone(habit: Habit, dateKey: string): boolean {
  return completionDayFilled(habit.completions[dateKey]);
}

function weekHasAnyCompletion(habit: Habit, weekMonday: Date): boolean {
  for (let i = 0; i < 7; i++) {
    const key = formatLocalDateKey(addLocalDays(weekMonday, i));
    if (isDayDone(habit, key)) return true;
  }
  return false;
}

function monthHasAnyCompletion(habit: Habit, monthStart: Date): boolean {
  const y = monthStart.getFullYear();
  const m = monthStart.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    const key = formatLocalDateKey(new Date(y, m, day));
    if (isDayDone(habit, key)) return true;
  }
  return false;
}

function streakDaily(habit: Habit, today: Date): number {
  let d = startOfLocalDay(today);
  if (!isDayDone(habit, formatLocalDateKey(d))) {
    d = addLocalDays(d, -1);
  }
  let streak = 0;
  while (isDayDone(habit, formatLocalDateKey(d))) {
    streak += 1;
    d = addLocalDays(d, -1);
  }
  return streak;
}

function streakWeekly(habit: Habit, today: Date): number {
  let w = mondayOfLocalWeekContaining(today);
  if (!weekHasAnyCompletion(habit, w)) {
    w = addLocalDays(w, -7);
  }
  let streak = 0;
  while (weekHasAnyCompletion(habit, w)) {
    streak += 1;
    w = addLocalDays(w, -7);
  }
  return streak;
}

function streakMonthly(habit: Habit, today: Date): number {
  let m = startOfLocalMonth(today);
  if (!monthHasAnyCompletion(habit, m)) {
    m = addLocalMonths(m, -1);
  }
  let streak = 0;
  while (monthHasAnyCompletion(habit, m)) {
    streak += 1;
    m = addLocalMonths(m, -1);
  }
  return streak;
}

/**
 * Текущая серия с учётом интервала цели:
 * — ежедневно: подряд идущие календарные дни с отметкой (сегодня можно ещё не отметить);
 * — неделя: подряд недели (Пн–Вс), в каждой хотя бы один день с отметкой;
 * — месяц: подряд календарные месяцы с хотя бы одной отметкой.
 */
export function computeHabitStreak(
  habit: Habit,
  referenceDate: Date = new Date(),
): number {
  const interval: HabitStreakInterval = habit.streakInterval ?? "none";
  if (interval === "none") return 0;

  const today = startOfLocalDay(referenceDate);

  switch (interval) {
    case "daily":
      return streakDaily(habit, today);
    case "weekly":
      return streakWeekly(habit, today);
    case "monthly":
      return streakMonthly(habit, today);
    default:
      return 0;
  }
}
