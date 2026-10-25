import type { Reminder } from "@/entities/habit";
import { jsWeekdayToReminderDay, parseReminderTime } from "./reminderSchedule";

/** Все срабатывания напоминания в [from, from+horizonDays], строго в будущем. */
export function listReminderFiresInHorizon(
  reminder: Reminder,
  from: Date = new Date(),
  horizonDays = 28,
): Date[] {
  if (!reminder.days.length) return [];
  const parsed = parseReminderTime(reminder.time);
  if (!parsed) return [];

  const daySet = new Set(reminder.days);
  const out: Date[] = [];
  const start = new Date(from.getTime());

  for (let offset = 0; offset <= horizonDays; offset += 1) {
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
    if (!daySet.has(jsWeekdayToReminderDay(candidate.getDay()))) continue;
    out.push(candidate);
  }

  return out;
}
