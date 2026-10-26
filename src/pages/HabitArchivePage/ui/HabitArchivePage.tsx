import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isHabitArchived,
  useHabitStore,
  type Habit,
} from "@/entities/habit";
import { ConfirmDialog } from "@/shared/ui/confirmDialog/ConfirmDialog";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Card } from "@/shared/ui/shadCNComponents/ui/card";

function formatArchivedDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const HabitArchivePage = () => {
  const navigate = useNavigate();
  const habits = useHabitStore((s) => s.habits);
  const unarchiveHabit = useHabitStore((s) => s.unarchiveHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  const archivedHabits = useMemo(() => {
    return habits
      .filter(isHabitArchived)
      .slice()
      .sort((a, b) => {
        const aTime = a.archivedAt ? Date.parse(a.archivedAt) : 0;
        const bTime = b.archivedAt ? Date.parse(b.archivedAt) : 0;
        return bTime - aTime;
      });
  }, [habits]);

  const handleRestore = (habit: Habit) => {
    unarchiveHabit(habit.id);
  };

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
        <div className="flex-1 text-center text-lg font-semibold">
          Архив привычек
        </div>
        <div className="size-8" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Архивные привычки скрыты с главного экрана. Статистика сохраняется —
          можно вернуть в любой момент.
        </p>

        {archivedHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-muted-foreground">Архив пуст</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Откройте привычку на главном экране и нажмите кнопку архива рядом
              с редактированием.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {archivedHabits.map((habit) => {
              const archivedLabel = formatArchivedDate(habit.archivedAt);
              return (
                <li key={habit.id}>
                  <Card className="gap-0 border p-0 shadow-none">
                    <div className="flex items-start gap-3 px-3.5 py-3">
                      <div
                        className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${habit.color}22` }}
                      >
                        <HabitIcon
                          name={habit.icon}
                          color={habit.color}
                          size={20}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-medium text-foreground">
                          {habit.name}
                        </div>
                        {habit.desc ? (
                          <div className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                            {habit.desc}
                          </div>
                        ) : null}
                        {archivedLabel ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            В архиве с {archivedLabel}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-border px-3.5 py-2.5">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 flex-1 rounded-lg"
                        onClick={() => handleRestore(habit)}
                      >
                        Вернуть
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(habit)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Удалить навсегда?"
        description={
          deleteTarget
            ? `«${deleteTarget.name}» и вся статистика будут удалены без возможности восстановления.`
            : ""
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteHabit(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
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
      aria-hidden
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
