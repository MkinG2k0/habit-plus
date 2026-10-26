import {
  completionDayFilled,
  computeHabitStreak,
  formatLocalDateKey,
  isHabitArchived,
  type Habit,
} from "@/entities/habit";

const DAY_NAMES_RU = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addLocalDays(base: Date, delta: number): Date {
  const x = startOfLocalDay(base);
  x.setDate(x.getDate() + delta);
  return x;
}

export function lastNLocalDateKeys(
  n: number,
  referenceDate: Date = new Date(),
): string[] {
  return Array.from({ length: n }, (_, i) =>
    formatLocalDateKey(addLocalDays(referenceDate, -(n - 1 - i))),
  );
}

function countFilledOnKeys(
  habit: Habit,
  keys: readonly string[],
): number {
  let n = 0;
  for (const key of keys) {
    if (completionDayFilled(habit.completions[key])) n += 1;
  }
  return n;
}

function countAllFilled(habit: Habit): number {
  let n = 0;
  for (const value of Object.values(habit.completions)) {
    if (completionDayFilled(value)) n += 1;
  }
  return n;
}

export interface HabitStatRow {
  habit: Habit;
  streak: number;
  filledLast30: number;
  rateLast30: number;
  totalFilled: number;
}

export interface DayActivityBar {
  key: string;
  label: string;
  filled: number;
  total: number;
  rate: number;
}

export interface HabitStatsSummary {
  activeCount: number;
  doneToday: number;
  rateToday: number;
  bestStreak: number;
  totalFilledAllTime: number;
  rateLast7: number;
  dayBars: DayActivityBar[];
  habits: HabitStatRow[];
}

export function computeHabitStatsSummary(
  habits: readonly Habit[],
  referenceDate: Date = new Date(),
): HabitStatsSummary {
  const active = habits.filter((h) => !isHabitArchived(h));
  const todayKey = formatLocalDateKey(referenceDate);
  const keys7 = lastNLocalDateKeys(7, referenceDate);
  const keys30 = lastNLocalDateKeys(30, referenceDate);
  const activeCount = active.length;

  let doneToday = 0;
  let bestStreak = 0;
  let totalFilledAllTime = 0;
  let filledSlots7 = 0;

  const habitRows: HabitStatRow[] = active.map((habit) => {
    const streak = computeHabitStreak(habit, referenceDate);
    bestStreak = Math.max(bestStreak, streak);

    const totalFilled = countAllFilled(habit);
    totalFilledAllTime += totalFilled;

    if (completionDayFilled(habit.completions[todayKey])) {
      doneToday += 1;
    }

    const filledLast7 = countFilledOnKeys(habit, keys7);
    filledSlots7 += filledLast7;

    const filledLast30 = countFilledOnKeys(habit, keys30);
    const rateLast30 =
      keys30.length === 0
        ? 0
        : Math.round((filledLast30 / keys30.length) * 100);

    return {
      habit,
      streak,
      filledLast30,
      rateLast30,
      totalFilled,
    };
  });

  habitRows.sort((a, b) => {
    if (b.rateLast30 !== a.rateLast30) return b.rateLast30 - a.rateLast30;
    if (b.streak !== a.streak) return b.streak - a.streak;
    return a.habit.name.localeCompare(b.habit.name, "ru");
  });

  const dayBars: DayActivityBar[] = keys7.map((key) => {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y!, m! - 1, d!);
    let filled = 0;
    for (const habit of active) {
      if (completionDayFilled(habit.completions[key])) filled += 1;
    }
    const total = activeCount;
    return {
      key,
      label: DAY_NAMES_RU[date.getDay()] ?? "",
      filled,
      total,
      rate: total === 0 ? 0 : Math.round((filled / total) * 100),
    };
  });

  const possibleSlots7 = activeCount * keys7.length;
  const rateLast7 =
    possibleSlots7 === 0
      ? 0
      : Math.round((filledSlots7 / possibleSlots7) * 100);

  return {
    activeCount,
    doneToday,
    rateToday:
      activeCount === 0 ? 0 : Math.round((doneToday / activeCount) * 100),
    bestStreak,
    totalFilledAllTime,
    rateLast7,
    dayBars,
    habits: habitRows,
  };
}
