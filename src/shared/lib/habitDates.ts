import { useMemo } from "react";

const DAY_NAMES_RU = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export interface DayInfo {
  key: string;
  label: string;
  date: number;
  isToday: boolean;
}

export function useTodayKey(): string {
  return useMemo(() => new Date().toISOString().slice(0, 10), []);
}

export function useLastNDays(n: number): DayInfo[] {
  return useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (n - 1 - i));
      return {
        key: d.toISOString().slice(0, 10),
        label: DAY_NAMES_RU[d.getDay()] ?? "",
        date: d.getDate(),
        isToday: i === n - 1,
      };
    });
  }, [n]);
}

const MONTH_NAMES_RU = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

export function formatMonthYearRu(d: Date): string {
  return `${MONTH_NAMES_RU[d.getMonth()] ?? ""} ${d.getFullYear()}`;
}

/** День в UTC, как в `habitStore` (`toISOString().slice(0, 10)`). */
export function getIsoDayKeyUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseIsoDayKeyUtc(key: string): Date {
  const [ys, ms, ds] = key.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const day = Number(ds);
  return new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
}

export function addUtcDays(d: Date, days: number): Date {
  const next = new Date(d.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Понедельник (UTC) недели, в которую попадает дата. */
export function startOfUtcWeekMonday(d: Date): Date {
  const x = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12),
  );
  const dow = x.getUTCDay();
  const fromMonday = (dow + 6) % 7;
  x.setUTCDate(x.getUTCDate() - fromMonday);
  return x;
}

const YEAR_WINDOW_DAYS = 365;

/**
 * Логика теплокарты: по умолчанию окно ~год назад от сегодня;
 * если первая отметка старше этого окна — от первой отметки до сегодня.
 * Сетка выравнивается по понедельнику (UTC, как ключи в сторе).
 */
export function getHabitHeatmapUtcRange(completions: Record<string, boolean>): {
  gridStartMonday: Date;
  rangeStart: Date;
  endDate: Date;
} {
  const now = new Date();
  const todayKey = getIsoDayKeyUtc(now);
  const endDate = parseIsoDayKeyUtc(todayKey);
  const oneYearAgo = addUtcDays(endDate, -YEAR_WINDOW_DAYS);
  const oneYearAgoKey = getIsoDayKeyUtc(oneYearAgo);

  const doneKeys = Object.keys(completions).filter((k) => completions[k]);
  doneKeys.sort();
  const firstKey = doneKeys[0];

  let rangeStart: Date;
  if (!firstKey) {
    rangeStart = oneYearAgo;
  } else if (firstKey < oneYearAgoKey) {
    rangeStart = parseIsoDayKeyUtc(firstKey);
  } else {
    rangeStart = oneYearAgo;
  }

  const gridStartMonday = startOfUtcWeekMonday(rangeStart);
  return { gridStartMonday, rangeStart, endDate };
}

export function buildUtcWeekColumns(
  gridStartMonday: Date,
  endDate: Date,
): Date[][] {
  const endMonday = startOfUtcWeekMonday(endDate);
  const weeks: Date[][] = [];
  let cursor = gridStartMonday;
  while (cursor.getTime() <= endMonday.getTime()) {
    weeks.push(
      Array.from({ length: 7 }, (_, i) => addUtcDays(cursor, i)),
    );
    cursor = addUtcDays(cursor, 7);
  }
  return weeks;
}
