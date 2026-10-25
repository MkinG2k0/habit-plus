import { Capacitor } from "@capacitor/core";
import { requestCapacitorNotificationPermission } from "./syncCapacitorReminders";

export async function ensureNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined") return "unsupported";

  if (Capacitor.isNativePlatform()) {
    const result = await requestCapacitorNotificationPermission();
    if (result === "granted") return "granted";
    if (result === "denied") return "denied";
    return "unsupported";
  }

  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export async function showHabitReminderNotification(opts: {
  title: string;
  body: string;
  tag: string;
  url?: string;
}): Promise<void> {
  const permission = await ensureNotificationPermission();
  if (permission !== "granted") return;

  const { title, body, tag, url = "/" } = opts;

  // На native доставка идёт через LocalNotifications.schedule — мгновенный показ не нужен
  if (Capacitor.isNativePlatform()) return;

  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.active) {
      reg.active.postMessage({
        type: "SHOW_NOTIFICATION",
        title,
        body,
        url,
        tag,
      });
      return;
    }
  } catch {
    // fallback ниже
  }

  new Notification(title, {
    body,
    tag,
    icon: "/logo.svg",
    data: url,
  });
}
