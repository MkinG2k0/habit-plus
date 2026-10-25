import type { Reminder } from "@/entities/habit";

/** Краткая подпись блока «Напоминание» на экране редактирования. */
export function formatRemindersSummary(
  reminders: Reminder[] | undefined,
): string {
  const n = reminders?.length ?? 0;
  if (n <= 0) return "Нет";
  const n100 = n % 100;
  const n10 = n % 10;
  if (n100 >= 11 && n100 <= 14) return `${n} активных`;
  if (n10 === 1) return `${n} активное`;
  if (n10 >= 2 && n10 <= 4) return `${n} активных`;
  return `${n} активных`;
}
