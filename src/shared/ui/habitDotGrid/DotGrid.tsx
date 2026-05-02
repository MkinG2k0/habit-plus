import { useLayoutEffect, useMemo, useRef } from "react";
import {
  buildUtcWeekColumns,
  getHabitHeatmapUtcRange,
  getIsoDayKeyUtc,
} from "@/shared/lib/habitDates";
import { cn } from "@/shared/ui/lib/utils";

interface DotGridProps {
  completions: Record<string, boolean>;
  color: string;
  dotSize?: number;
  gap?: number;
}

export const DotGrid = ({
  completions,
  color,
  dotSize = 7,
  gap = 3,
}: DotGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const cells = useMemo(() => {
    const { gridStartMonday, rangeStart, endDate } =
      getHabitHeatmapUtcRange(completions);
    const weeks = buildUtcWeekColumns(gridStartMonday, endDate);
    const rsTime = rangeStart.getTime();
    const edTime = endDate.getTime();
    const flat = weeks.flatMap((week) =>
      week.map((d) => {
        const key = getIsoDayKeyUtc(d);
        const t = d.getTime();
        const inRange = t >= rsTime && t <= edTime;
        const done = inRange && (completions[key] ?? false);
        return { key, inRange, done };
      }),
    );
    return flat;
  }, [completions]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, [completions, cells.length]);

  return (
    <div
      ref={scrollRef}
      className="w-full min-w-0 overflow-x-auto [scrollbar-width:thin]"
    >
      <div
        className="grid w-max pb-2"
        style={{
          gridAutoFlow: "column",
          gridTemplateRows: `repeat(7, ${dotSize}px)`,
          columnGap: gap,
          rowGap: gap,
        }}
      >
        {cells.map((dot) => (
          <div
            key={dot.key}
            className={cn("shrink-0 rounded-[2px] transition-colors")}
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: color,
              opacity: dot.inRange ? (dot.done ? 1 : 0.1) : 0.06,
            }}
          />
        ))}
      </div>
    </div>
  );
};
