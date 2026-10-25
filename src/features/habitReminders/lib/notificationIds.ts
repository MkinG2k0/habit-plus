/** Стабильный положительный 31-bit id для Capacitor LocalNotifications. */
export function habitReminderNotificationId(
  habitId: number,
  reminderId: number,
  atMs: number,
): number {
  const dayKey = Math.floor(atMs / 86_400_000);
  let h = 2166136261;
  const parts = [habitId, reminderId, dayKey];
  for (const part of parts) {
    h ^= part >>> 0;
    h = Math.imul(h, 16777619);
  }
  const id = h >>> 0;
  return (id % 0x7fffffff) || 1;
}

export function habitReminderTag(
  habitId: number,
  reminderId: number,
  atMs: number,
): string {
  return `habit-reminder:${habitId}:${reminderId}:${atMs}`;
}

export const HABIT_REMINDER_TAG_PREFIX = "habit-reminder:";
