import type { Reminder } from "@/entities/habit";

/** Дни в Reminder: 0 = Пн … 6 = Вс. */
export function jsWeekdayToReminderDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export function parseReminderTime(
  time: string,
): { hours: number; minutes: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return { hours, minutes };
}

/** Ближайший момент срабатывания напоминания (строго в будущем). */
export function nextReminderFireAt(
  reminder: Reminder,
  from: Date = new Date(),
): Date | null {
  if (!reminder.days.length) return null;
  const parsed = parseReminderTime(reminder.time);
  if (!parsed) return null;

  const daySet = new Set(reminder.days);
  const start = new Date(from.getTime());

  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + offset,
      parsed.hours,
      parsed.minutes,
      0,
      0,
    );
    if (candidate.getTime() <= from.getTime()) continue;
    if (daySet.has(jsWeekdayToReminderDay(candidate.getDay()))) {
      return candidate;
    }
  }
  return null;
}

export function createDefaultReminder(): Reminder {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    days: [0, 1, 2, 3, 4],
    time: "10:00",
  };
}
