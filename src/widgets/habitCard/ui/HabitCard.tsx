import type { Habit } from "@/entities/habit";
import { DotGrid } from "@/shared/ui/habitDotGrid/DotGrid";
import { Card, CardContent } from "@/shared/ui/shadCNComponents/ui/card";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { cn } from "@/shared/ui/lib/utils";

interface HabitCardProps {
  habit: Habit;
  isDoneToday: boolean;
  onToggle: () => void;
  onOpen: () => void;
}

export const HabitCard = ({
  habit,
  isDoneToday,
  onToggle,
  onOpen,
}: HabitCardProps) => {
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
        "cursor-pointer gap-0 border p-2 py-4 pb-2 shadow-sm transition-opacity hover:opacity-[0.98]",
      )}
    >
      <CardContent className="flex flex-col gap-2.5 p-0 px-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${habit.color}22` }}
          >
            <HabitIcon name={habit.icon} color={habit.color} size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold text-foreground">
              {habit.name}
            </div>
            {habit.desc ? (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {habit.desc}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="flex size-11 cursor-pointer shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
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
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              className="transition-all hover:scale-110 active:scale-95"
              stroke="var(--primary-foreground)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
        <DotGrid
          completions={habit.completions}
          color={habit.color}
          dotSize={8}
          gap={3}
        />
      </CardContent>
    </Card>
  );
};
