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
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 tabular-nums text-muted-foreground",
        size === "sm" ? "text-[11px]" : "text-xs",
        className,
      )}
      aria-label={`Текущая серия: ${count}`}
    >
      <Flame
        size={iconSize}
        className="shrink-0 text-orange-500"
        aria-hidden
      />
      <span className="font-medium text-foreground">{count}</span>
    </span>
  );
};
