import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useHabitStore, type Habit, type Reminder } from "@/entities/habit";
import { nextReminderFireAt } from "./reminderSchedule";
import { showHabitReminderNotification } from "./showHabitReminderNotification";
import { syncHabitReminders } from "./syncHabitReminders";
import { habitReminderTag } from "./notificationIds";

const MAX_TIMEOUT_MS = 2_147_483_647;

type Scheduled = {
  key: string;
  timerId: ReturnType<typeof setTimeout>;
};

function reminderKey(habitId: number, reminder: Reminder): string {
  return `${habitId}:${reminder.id}:${reminder.time}:${reminder.days.join(",")}`;
}

function collectNextFires(habits: Habit[], now: Date) {
  const items: {
    key: string;
    habit: Habit;
    reminder: Reminder;
    at: Date;
  }[] = [];

  for (const habit of habits) {
    for (const reminder of habit.reminders ?? []) {
      const at = nextReminderFireAt(reminder, now);
      if (!at) continue;
      items.push({
        key: reminderKey(habit.id, reminder),
        habit,
        reminder,
        at,
      });
    }
  }

  return items;
}

function openReminderUrl(url: string) {
  const target = url || "/";
  if (typeof window === "undefined") return;
  if (window.location.pathname === target) return;
  window.location.assign(target);
}

/**
 * Native: OS Local Notifications (фон / закрытое приложение).
 * Web/PWA: SW-расписание + таймеры вкладки как страховка.
 */
export function useHabitReminderScheduler() {
  const habits = useHabitStore((s) => s.habits);
  const timersRef = useRef<Map<string, Scheduled>>(new Map());

  useEffect(() => {
    void syncHabitReminders(habits);
  }, [habits]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handle: PluginListenerHandle | undefined;
    let appHandle: PluginListenerHandle | undefined;

    void LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (event) => {
        const url =
          (event.notification.extra as { url?: string } | undefined)?.url ??
          "/";
        openReminderUrl(url);
      },
    ).then((h) => {
      handle = h;
    });

    // После возврата из фона / смены exact-alarm — перепланировать
    void App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        void syncHabitReminders(useHabitStore.getState().habits);
      }
    }).then((h) => {
      appHandle = h;
    });

    return () => {
      void handle?.remove();
      void appHandle?.remove();
    };
  }, []);

  // Web: ближайшие setTimeout — пока вкладка жива (дополнение к SW)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const timers = timersRef.current;

    const clearAll = () => {
      for (const entry of timers.values()) {
        clearTimeout(entry.timerId);
      }
      timers.clear();
    };

    const arm = () => {
      clearAll();
      const now = new Date();
      const items = collectNextFires(habits, now);

      for (const item of items) {
        const delay = item.at.getTime() - now.getTime();
        if (delay <= 0 || delay > MAX_TIMEOUT_MS) continue;

        const timerId = setTimeout(() => {
          void showHabitReminderNotification({
            title: item.habit.name,
            body: "Пора выполнить привычку",
            tag: habitReminderTag(
              item.habit.id,
              item.reminder.id,
              item.at.getTime(),
            ),
            url: "/",
          });
          void syncHabitReminders(useHabitStore.getState().habits);
          arm();
        }, delay);

        timers.set(item.key, { key: item.key, timerId });
      }
    };

    arm();
    return clearAll;
  }, [habits]);
}
