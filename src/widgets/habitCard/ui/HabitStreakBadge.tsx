import { Flame } from "lucide-react";
import { computeHabitStreak, type Habit } from "@/entities/habit";
import { cn } from "@/shared/ui/lib/utils";

interface HabitStreakBadgeProps {
  habit: Habit;
  className?: string;
  /** Компактный вид для мини-карточек и списка. */
  size?: "sm" | "md";
}

/** Текущая серия; скрыт, если цель серии не задана. */
export const HabitStreakBadge = ({
  habit,
  className,
  size = "md",
}: HabitStreakBadgeProps) => {
  const interval = habit.streakInterval ?? "none";
  if (interval === "none") return null;

  const count = computeHabitStreak(habit);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 font-semibold leading-none text-foreground",
        size === "sm" ? "text-[11px]" : "text-inherit",
        className,
      )}
      aria-label={`Текущая серия: ${count}`}
    >
      <span className="inline-block min-w-[2ch] text-right tabular-nums">
        {count}
      </span>
      <Flame
        className="size-[1em] shrink-0 text-orange-500"
        strokeWidth={2.25}
        aria-hidden
      />
    </span>
  );
};
