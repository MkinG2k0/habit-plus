import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useHabitStore, type Reminder } from "@/entities/habit";
import {
  createDefaultReminder,
  ensureNotificationPermission,
  remindersRunInBackground,
  syncHabitReminders,
} from "@/features/habitReminders";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Card, CardContent } from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const HabitRemindersPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const habitId = Number(id);
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  const updateHabit = useHabitStore((s) => s.updateHabit);

  const [reminders, setReminders] = useState<Reminder[]>(
    () => habit?.reminders ?? [],
  );
  const [permissionHint, setPermissionHint] = useState<string | null>(null);

  useEffect(() => {
    if (!habit) {
      navigate("/", { replace: true });
    }
  }, [habit, navigate]);

  useEffect(() => {
    if (habit) {
      setReminders(habit.reminders ?? []);
    }
  }, [habit?.id, habit?.reminders]);

  const title = useMemo(
    () =>
      reminders.length > 0
        ? `Напоминания (${reminders.length})`
        : "Напоминания",
    [reminders.length],
  );

  const persist = (next: Reminder[]) => {
    setReminders(next);
    if (!Number.isFinite(habitId)) return;
    updateHabit(habitId, {
      reminders: next.length ? next : undefined,
    });
  };

  const requestPermissionIfNeeded = async () => {
    const result = await ensureNotificationPermission();
    if (result === "unsupported") {
      setPermissionHint(
        "Уведомления на этой платформе недоступны. Напоминания сохранятся, но всплывать не будут.",
      );
      return;
    }
    if (result === "denied") {
      setPermissionHint(
        remindersRunInBackground()
          ? "Разрешите уведомления в настройках приложения, чтобы получать напоминания."
          : "Разрешите уведомления в настройках браузера. В установленном PWA (Chrome) фон работает ограниченно без серверного push.",
      );
      return;
    }
    setPermissionHint(null);
    const allHabits = useHabitStore.getState().habits;
    void syncHabitReminders(allHabits);
  };

  const toggleDay = (reminderId: number, dayIndex: number) => {
    persist(
      reminders.map((r) => {
        if (r.id !== reminderId) return r;
        const has = r.days.includes(dayIndex);
        const days = has
          ? r.days.filter((d) => d !== dayIndex)
          : [...r.days, dayIndex].sort((a, b) => a - b);
        return { ...r, days };
      }),
    );
  };

  const setTime = (reminderId: number, time: string) => {
    persist(
      reminders.map((r) => (r.id === reminderId ? { ...r, time } : r)),
    );
  };

  const removeReminder = (reminderId: number) => {
    persist(reminders.filter((r) => r.id !== reminderId));
  };

  const addReminder = async () => {
    await requestPermissionIfNeeded();
    const next = [...reminders, createDefaultReminder()];
    persist(next);
  };

  if (!habit) return null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex shrink-0 items-center border-b border-border px-4 py-3.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <BackIcon />
        </Button>
        <div className="flex-1 text-center text-lg font-semibold">{title}</div>
        <div className="size-8" />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {permissionHint ? (
          <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {permissionHint}
          </p>
        ) : null}

        {reminders.length === 0 ? (
          <Card className="border shadow-none">
            <CardContent className="px-3.5 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Пока нет напоминаний. Добавьте время и дни недели.
                {remindersRunInBackground()
                  ? " Уведомления приходят даже если приложение закрыто."
                  : " В установленном PWA браузер может доставить напоминание в фоне (best-effort); надёжный фон — в мобильном приложении."}
              </p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder, index) => (
            <Card key={reminder.id} className="border shadow-none">
              <CardContent className="px-3.5 py-3.5">
                <div className="mb-3 text-sm font-semibold text-foreground">
                  Напоминание #{index + 1}
                </div>
                <div className="mb-3 flex gap-1.5">
                  {DAY_LABELS.map((d, i) => {
                    const active = reminder.days.includes(i);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(reminder.id, i)}
                        aria-pressed={active}
                        className={cn(
                          "flex h-9 flex-1 items-center justify-center rounded-md text-[13px] font-medium transition-colors",
                          active
                            ? "bg-chart-1 text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-border bg-muted px-3.5 py-2.5">
                    <ClockIcon />
                    <input
                      type="time"
                      value={reminder.time}
                      onChange={(e) => setTime(reminder.id, e.target.value)}
                      onBlur={() => void requestPermissionIfNeeded()}
                      className="font-numeric w-full bg-transparent text-base font-semibold text-foreground outline-none"
                      aria-label={`Время напоминания ${index + 1}`}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="size-11 shrink-0 rounded-md border border-border"
                    aria-label="Удалить напоминание"
                    onClick={() => removeReminder(reminder.id)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full rounded-lg border border-border"
          onClick={() => void addReminder()}
        >
          Добавить напоминание
        </Button>
      </div>
    </div>
  );
};

function BackIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0 text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-destructive"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
