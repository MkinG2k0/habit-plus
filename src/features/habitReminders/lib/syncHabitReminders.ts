import { Capacitor } from "@capacitor/core";
import type { Habit } from "@/entities/habit";
import { syncCapacitorReminders } from "./syncCapacitorReminders";
import { syncWebReminders } from "./syncWebReminders";

/** Перепланирует фоновые напоминания под текущий список привычек. */
export async function syncHabitReminders(habits: Habit[]): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await syncCapacitorReminders(habits);
    return;
  }
  await syncWebReminders(habits);
}

export function remindersRunInBackground(): boolean {
  return Capacitor.isNativePlatform();
}
