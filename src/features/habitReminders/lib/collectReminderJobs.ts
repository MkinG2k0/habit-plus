import { isHabitArchived, type Habit } from "@/entities/habit";
import { listReminderFiresInHorizon } from "./listReminderFires";
import {
  habitReminderNotificationId,
  habitReminderTag,
} from "./notificationIds";

export type ReminderJob = {
  id: number;
  tag: string;
  habitId: number;
  reminderId: number;
  title: string;
  body: string;
  url: string;
  at: Date;
};

const DEFAULT_BODY = "Пора выполнить привычку";

export function collectReminderJobs(
  habits: Habit[],
  from: Date = new Date(),
  horizonDays = 28,
): ReminderJob[] {
  const jobs: ReminderJob[] = [];

  for (const habit of habits) {
    if (isHabitArchived(habit)) continue;
    for (const reminder of habit.reminders ?? []) {
      for (const at of listReminderFiresInHorizon(reminder, from, horizonDays)) {
        const atMs = at.getTime();
        jobs.push({
          id: habitReminderNotificationId(habit.id, reminder.id, atMs),
          tag: habitReminderTag(habit.id, reminder.id, atMs),
          habitId: habit.id,
          reminderId: reminder.id,
          title: habit.name,
          body: DEFAULT_BODY,
          url: "/",
          at,
        });
      }
    }
  }

  return jobs;
}
