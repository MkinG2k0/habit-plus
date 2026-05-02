import type { Habit } from "@/entities/habit";
import { DotGrid } from "@/shared/ui/habitDotGrid/DotGrid";
import { Card, CardContent } from "@/shared/ui/shadCNComponents/ui/card";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { cn } from "@/shared/ui/lib/utils";
import { formatMonthYearRu } from "@/shared/lib/habitDates";

interface HabitMiniCardProps {
  habit: Habit;
  onOpen: () => void;
}

export const HabitMiniCard = ({ habit, onOpen }: HabitMiniCardProps) => {
  const monthLabel = formatMonthYearRu(new Date());

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
        "min-w-0 flex-1 cursor-pointer gap-0 border py-3 shadow-sm",
      )}
    >
      <CardContent className="flex flex-col gap-2 px-3 pb-3 pt-0">
        <div className="flex items-center gap-2">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: habit.color }}
          >
            <HabitIcon name={habit.icon} color="#fff" size={14} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold leading-[18px] text-foreground">
              {habit.name}
            </div>
            <div className="text-[11px] text-muted-foreground">{monthLabel}</div>
          </div>
        </div>
        <DotGrid
          completions={habit.completions}
          color={habit.color}
          dotSize={6}
          gap={2}
        />
      </CardContent>
    </Card>
  );
};
