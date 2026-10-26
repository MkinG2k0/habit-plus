import { useMemo } from "react";
import { Check } from "lucide-react";
import {
  completionDayFilled,
  foregroundOnHabitColor,
  formatLocalDateKey,
  type Habit,
  type HabitCompletionValue,
} from "@/entities/habit";
import { DotGrid } from "@/shared/ui/habitDotGrid/DotGrid";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { cn } from "@/shared/ui/lib/utils";
import {
  habitShareRangeToHeatmapWindow,
  type HabitShareRangeId,
} from "../model/shareRange";

export type HabitShareCardTheme = "light" | "dark";

interface HabitShareCardProps {
  habit: Habit;
  accentColor: string;
  theme: HabitShareCardTheme;
  showCompletionIndicator: boolean;
  showDescription: boolean;
  range: HabitShareRangeId;
  className?: string;
}

/** Текущая неделя пн→вс одной горизонтальной строкой. */
function ShareWeekRow({
  completions,
  color,
}: {
  completions: Record<string, HabitCompletionValue>;
  color: string;
}) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const todayKey = formatLocalDateKey(today);
    const fromMonday = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - fromMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = formatLocalDateKey(d);
      const inRange = key <= todayKey;
      const done = inRange && completionDayFilled(completions[key]);
      return { key, inRange, done };
    });
  }, [completions]);

  return (
    <div className="flex h-full items-center justify-center gap-1.5">
      {days.map((dot) => (
        <div
          key={dot.key}
          className="aspect-square min-h-0 min-w-0 flex-1 max-w-9 rounded-md"
          style={{
            backgroundColor: color,
            opacity: dot.inRange ? (dot.done ? 1 : 0.28) : 0.12,
          }}
        />
      ))}
    </div>
  );
}

export const HabitShareCard = ({
  habit,
  accentColor,
  theme,
  showCompletionIndicator,
  showDescription,
  range,
  className,
}: HabitShareCardProps) => {
  const isDark = theme === "dark";
  const brandColor = foregroundOnHabitColor(accentColor);
  const todayKey = formatLocalDateKey(new Date());
  const completedToday = completionDayFilled(habit.completions[todayKey]);
  const heatmapWindow = useMemo(
    () => habitShareRangeToHeatmapWindow(range),
    [range],
  );
  const isWeek = range === "week";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl p-2.5",
        className,
      )}
      style={{ backgroundColor: accentColor }}
    >
      <div
        className={cn(
          "rounded-2xl p-2.5",
          isDark ? "bg-neutral-950 text-neutral-50" : "bg-white text-neutral-950",
        )}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              isDark ? "bg-neutral-900" : "bg-neutral-100",
            )}
          >
            <HabitIcon name={habit.icon} color={accentColor} size={20} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="truncate text-base font-bold leading-tight">
              {habit.name}
            </div>
            {showDescription && habit.desc.trim() ? (
              <div
                className={cn(
                  "mt-0.5 line-clamp-2 text-sm leading-snug",
                  isDark ? "text-neutral-400" : "text-neutral-500",
                )}
              >
                {habit.desc}
              </div>
            ) : null}
          </div>
          {showCompletionIndicator ? (
            <div
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                !completedToday &&
                  (isDark
                    ? "bg-neutral-800 text-neutral-500"
                    : "bg-neutral-200 text-neutral-400"),
              )}
              style={
                completedToday
                  ? {
                      backgroundColor: accentColor,
                      color: brandColor,
                    }
                  : undefined
              }
              aria-hidden
            >
              <Check size={14} strokeWidth={2.5} />
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            // Тёмный трек в обеих темах — акцентные цвета читаются на светлой карточке.
            "mt-2 overflow-hidden rounded-lg bg-neutral-900 p-1",
            isWeek
              ? "h-12"
              : range === "month"
                ? "h-24"
                : range === "months3" || range === "months6"
                  ? "h-20"
                  : "h-[4.5rem]",
          )}
        >
          {isWeek ? (
            <ShareWeekRow
              completions={habit.completions}
              color={accentColor}
            />
          ) : (
            <DotGrid
              completions={habit.completions}
              color={accentColor}
              adaptive
              gap={2}
              emptyOpacity={0.28}
              outOfRangeOpacity={0.12}
              className="h-full"
              heatmapWindow={heatmapWindow}
              key={range}
            />
          )}
        </div>
      </div>

      <div
        className="mt-1.5 flex items-center justify-end gap-1 pr-0.5"
        style={{ color: brandColor }}
      >
        <img
          src="/logo.svg"
          alt=""
          width={14}
          height={14}
          className="size-3.5 opacity-90"
          draggable={false}
        />
        <span className="text-xs font-semibold tracking-tight">
          Habi<span className="opacity-80">day</span>
        </span>
      </div>
    </div>
  );
};
