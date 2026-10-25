import { Capacitor } from "@capacitor/core";
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from "@capacitor/local-notifications";
import type { Habit } from "@/entities/habit";
import { collectReminderJobs } from "./collectReminderJobs";

export const HABIT_REMINDER_CHANNEL_ID = "habit-reminders";

async function ensureChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await LocalNotifications.createChannel({
      id: HABIT_REMINDER_CHANNEL_ID,
      name: "Напоминания",
      description: "Напоминания о привычках",
      importance: 5,
      visibility: 1,
      vibration: true,
    });
  } catch {
    // канал уже есть или платформа без каналов
  }
}

export async function requestCapacitorNotificationPermission(): Promise<
  "granted" | "denied" | "unsupported"
> {
  if (!Capacitor.isNativePlatform()) return "unsupported";
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === "granted") return "granted";
    const next = await LocalNotifications.requestPermissions();
    return next.display === "granted" ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

/** Планирует локальные OS-уведомления на горизонт (работают при закрытом приложении). */
export async function syncCapacitorReminders(habits: Habit[]): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await ensureChannel();

  const permission = await requestCapacitorNotificationPermission();
  if (permission !== "granted") {
    try {
      await LocalNotifications.cancelAll();
    } catch {
      // ignore
    }
    return;
  }

  try {
    await LocalNotifications.cancelAll();
  } catch {
    // ignore
  }

  const jobs = collectReminderJobs(habits);
  if (!jobs.length) return;

  const notifications: LocalNotificationSchema[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    body: job.body,
    schedule: {
      at: job.at,
      allowWhileIdle: true,
    },
    channelId: HABIT_REMINDER_CHANNEL_ID,
    extra: {
      url: job.url,
      habitId: job.habitId,
      reminderId: job.reminderId,
      tag: job.tag,
    },
    autoCancel: true,
  }));

  // Android/iOS лимиты на пачку — режем по 64
  const CHUNK = 64;
  for (let i = 0; i < notifications.length; i += CHUNK) {
    const chunk = notifications.slice(i, i + CHUNK);
    await LocalNotifications.schedule({ notifications: chunk });
  }
}
