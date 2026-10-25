import type { Habit } from "@/entities/habit";
import { DotGrid } from "@/shared/ui/habitDotGrid/DotGrid";
import { Card, CardContent } from "@/shared/ui/shadCNComponents/ui/card";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { cn } from "@/shared/ui/lib/utils";
import { HabitStreakBadge } from "./HabitStreakBadge";

interface HabitMiniCardProps {
  habit: Habit;
  onOpen: () => void;
  isDoneToday?: boolean;
  onToggle?: () => void;
}

/** Вертикальная колонка привычки для режима «колонки». */
export const HabitMiniCard = ({
  habit,
  onOpen,
  isDoneToday = false,
  onToggle,
}: HabitMiniCardProps) => {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "flex h-full w-[8.5rem] shrink-0 cursor-pointer flex-col gap-0 overflow-hidden border p-0 shadow-sm",
      )}
    >
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2.5 p-2.5">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: habit.color }}
        >
          <HabitIcon name={habit.icon} color="#fff" size={18} />
        </div>

        <div className="min-w-0 shrink-0 space-y-1">
          <div className="line-clamp-2 text-[13px] font-semibold leading-4 text-foreground">
            {habit.name}
          </div>
          <HabitStreakBadge habit={habit} size="sm" />
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden pt-0.5">
          <DotGrid
            completions={habit.completions}
            color={habit.color}
            gap={3}
            adaptive
          />
        </div>

        {onToggle ? (
          <button
            type="button"
            className="flex h-9 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all hover:scale-[1.02] active:scale-95"
            style={{
              backgroundColor: isDoneToday ? habit.color : `${habit.color}33`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-label={
              isDoneToday ? "Отменить на сегодня" : "Отметить на сегодня"
            }
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary-foreground)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
};
