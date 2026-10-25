import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { completionDayFilled } from "@/entities/habit";
import {
  buildUtcWeekColumns,
  getHabitHeatmapUtcRange,
  getIsoDayKeyUtc,
} from "@/shared/lib/habitDates";
import { cn } from "@/shared/ui/lib/utils";

interface DotGridProps {
  completions: Record<string, boolean | number>;
  color: string;
  dotSize?: number;
  gap?: number;
  className?: string;
  /** Подогнать сетку под ширину и высоту контейнера (без пустоты). */
  adaptive?: boolean;
}

type DotCell = { key: string; inRange: boolean; done: boolean };

export const DotGrid = ({
  completions,
  color,
  dotSize = 7,
  gap = 3,
  className,
  adaptive = false,
}: DotGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ size: dotSize, weekCount: 0 });

  const weekColumns = useMemo(() => {
    const { gridStartMonday, rangeStart, endDate } =
      getHabitHeatmapUtcRange(completions);
    const weeks = buildUtcWeekColumns(gridStartMonday, endDate);
    const rsTime = rangeStart.getTime();
    const edTime = endDate.getTime();
    return weeks.map((week) =>
      week.map((d): DotCell => {
        const key = getIsoDayKeyUtc(d);
        const t = d.getTime();
        const inRange = t >= rsTime && t <= edTime;
        const done = inRange && completionDayFilled(completions[key]);
        return { key, inRange, done };
      }),
    );
  }, [completions]);

  const visibleWeeks = useMemo(() => {
    if (!adaptive || fit.weekCount <= 0) return weekColumns;
    return weekColumns.slice(-fit.weekCount);
  }, [adaptive, fit.weekCount, weekColumns]);

  const cells = useMemo(() => visibleWeeks.flat(), [visibleWeeks]);
  const size = adaptive ? fit.size : dotSize;

  useLayoutEffect(() => {
    if (!adaptive) {
      setFit({ size: dotSize, weekCount: 0 });
      return;
    }
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const h = el.clientHeight;
      const w = el.clientWidth;
      if (h <= 0 || w <= 0) return;

      // Квадратные ячейки: 7 рядов на всю высоту → число недель ≈ 7·w/h
      const sizeFromH = Math.max(6, (h - gap * 6) / 7);
      const weeksForSquare = Math.max(1, Math.round(w / sizeFromH));
      const weekCount = Math.max(4, weeksForSquare);
      const nextSize = Math.round(sizeFromH);
      setFit((prev) =>
        prev.size === nextSize && prev.weekCount === weekCount
          ? prev
          : { size: nextSize, weekCount },
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [adaptive, gap, dotSize]);

  useLayoutEffect(() => {
    if (adaptive) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, [adaptive, completions, cells.length, size]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "h-full w-full min-h-0 min-w-0",
        adaptive
          ? "overflow-hidden"
          : "overflow-x-auto [scrollbar-width:thin]",
        className,
      )}
    >
      <div
        className={cn("grid", adaptive ? "h-full w-full" : "w-max")}
        style={
          adaptive
            ? {
                gridTemplateRows: "repeat(7, 1fr)",
                gridTemplateColumns: `repeat(${Math.max(1, visibleWeeks.length)}, 1fr)`,
                gridAutoFlow: "column",
                gap,
              }
            : {
                gridAutoFlow: "column",
                gridTemplateRows: `repeat(7, ${size}px)`,
                columnGap: gap,
                rowGap: gap,
              }
        }
      >
        {cells.map((dot) => (
          <div
            key={dot.key}
            className={cn(
              "min-h-0 min-w-0 rounded-[2px] transition-colors",
              !adaptive && "shrink-0",
            )}
            style={{
              ...(adaptive
                ? { width: "100%", height: "100%" }
                : { width: size, height: size }),
              backgroundColor: color,
              opacity: dot.inRange ? (dot.done ? 1 : 0.1) : 0.06,
            }}
          />
        ))}
      </div>
    </div>
  );
};
