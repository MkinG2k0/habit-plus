import type { Habit } from "@/entities/habit";
import type { DayInfo } from "@/shared/lib/habitDates";
import { Card } from "@/shared/ui/shadCNComponents/ui/card";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { cn } from "@/shared/ui/lib/utils";

interface HabitListRowProps {
  habit: Habit;
  days: DayInfo[];
  onToggle: () => void;
  onOpen: () => void;
}

export const HabitListRow = ({
  habit,
  days,
  onToggle,
  onOpen,
}: HabitListRowProps) => {
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
        "flex h-14 cursor-pointer items-center gap-2.5 border py-0 pl-3 pr-3 shadow-sm",
      )}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${habit.color}22` }}
      >
        <HabitIcon name={habit.icon} color={habit.color} size={16} />
      </div>
      <div className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">
        {habit.name}
      </div>
      <div className="flex gap-1.5">
        {days.map((day) => {
          const filled = habit.completions[day.key] ?? false;
          return (
            <button
              key={day.key}
              type="button"
              className={cn(
                "size-7 shrink-0 rounded-md transition-colors",
                day.isToday ? "cursor-pointer" : "cursor-default",
              )}
              style={{
                backgroundColor: filled
                  ? habit.color
                  : `${habit.color}25`,
              }}
              onClick={
                day.isToday
                  ? (e) => {
                      e.stopPropagation();
                      onToggle();
                    }
                  : undefined
              }
              aria-label={day.isToday ? "Переключить сегодня" : undefined}
            />
          );
        })}
      </div>
    </Card>
  );
};
