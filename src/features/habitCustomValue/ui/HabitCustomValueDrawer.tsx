import { useEffect, useState } from "react";
import {
  getCompletionNumericValue,
  useHabitStore,
  type Habit,
} from "@/entities/habit";
import { useTodayKey } from "@/shared/lib/habitDates";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/shadCNComponents/ui/drawer";
import { cn } from "@/shared/ui/lib/utils";

const STEP_PRESETS = [1, 5, 10, 50, 100] as const;
type StepPreset = (typeof STEP_PRESETS)[number];

interface HabitCustomValueDrawerProps {
  habit: Habit | null;
  dateKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HabitCustomValueDrawer = ({
  habit,
  dateKey,
  open,
  onOpenChange,
}: HabitCustomValueDrawerProps) => {
  const todayKey = useTodayKey();
  const setHabitDayCompletionValue = useHabitStore(
    (s) => s.setHabitDayCompletionValue,
  );
  const [stepSize, setStepSize] = useState<StepPreset>(1);
  const [draft, setDraft] = useState(0);

  const dayChipLabel =
    dateKey === todayKey
      ? "Сегодня"
      : formatDateKeyShortRu(dateKey);

  useEffect(() => {
    if (!open || !habit) return;
    setDraft(getCompletionNumericValue(habit.completions[dateKey]));
    setStepSize(1);
  }, [open, habit, dateKey]);

  const goal = Math.max(1, habit?.dailyGoal ?? 1);
  const progressPct = Math.min(100, (draft / goal) * 100);

  const applyDelta = (delta: number) => {
    setDraft((v) => Math.max(0, v + delta));
  };

  const handleSave = () => {
    if (!habit) return;
    setHabitDayCompletionValue(habit.id, dateKey, draft);
    onOpenChange(false);
  };

  const handleReset = () => {
    if (!habit) return;
    setHabitDayCompletionValue(habit.id, dateKey, 0);
    onOpenChange(false);
  };

  const fillDayAndClose = () => {
    if (!habit) return;
    setHabitDayCompletionValue(habit.id, dateKey, goal);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="z-60 border-border bg-background px-4">
        <DrawerTitle className="sr-only">
          Значение за {dateKey}
        </DrawerTitle>
        {habit ? (
          <>
            <DrawerHeader className="flex-row flex-wrap items-center gap-2 pb-2 pt-2 text-left">
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs text-foreground">
                <CalendarMiniIcon />
                <span>{dayChipLabel}</span>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
                <HabitIcon name={habit.icon} color={habit.color} size={14} />
                <span className="truncate text-xs font-medium text-foreground">
                  {habit.name}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => onOpenChange(false)}
                aria-label="Закрыть"
              >
                <CloseMiniIcon />
              </Button>
            </DrawerHeader>

            <div
              className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={draft}
              aria-valuemin={0}
              aria-valuemax={goal}
              aria-label="Прогресс к цели на день"
            >
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: habit.color,
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-12 rounded-full border border-border text-xl"
                onClick={() => applyDelta(-stepSize)}
                aria-label="Уменьшить"
              >
                −
              </Button>
              <div className="min-w-[100px] text-center text-2xl font-semibold tabular-nums text-foreground">
                {draft}
                <span className="text-lg font-normal text-muted-foreground">
                  {" "}
                  / {goal}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-12 rounded-full border border-border text-xl"
                onClick={() => applyDelta(stepSize)}
                aria-label="Увеличить"
              >
                +
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 pb-2">
              {STEP_PRESETS.map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={stepSize === n ? "default" : "secondary"}
                  size="sm"
                  className={cn(
                    "h-9 min-w-11 rounded-lg px-3 font-semibold",
                    stepSize === n && "shadow-sm",
                    stepSize !== n && "border border-border",
                  )}
                  aria-pressed={stepSize === n}
                  onClick={() => setStepSize(n)}
                >
                  {n}
                </Button>
              ))}
            </div>

            <DrawerFooter className="flex-col gap-2 pb-6 pt-0 sm:flex-row sm:flex-wrap">
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-xl border-border"
                  onClick={handleReset}
                >
                  Сбросить
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 flex-1 rounded-xl border border-border"
                  onClick={fillDayAndClose}
                >
                  Заполнить день
                </Button>
              </div>
              <Button
                type="button"
                className="h-11 w-full rounded-xl font-semibold sm:flex-1"
                style={{ backgroundColor: habit.color }}
                onClick={handleSave}
              >
                Сохранить
              </Button>
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
};

function formatDateKeyShortRu(key: string): string {
  const [ys, ms, ds] = key.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!y || !m || !d) return key;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

function CalendarMiniIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CloseMiniIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
