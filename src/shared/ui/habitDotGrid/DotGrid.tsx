import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { completionDayFilled } from "@/entities/habit";
import {
  buildUtcWeekColumns,
  getHabitHeatmapUtcRange,
  getIsoDayKeyUtc,
  type HabitHeatmapWindow,
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
  /** Окно дат теплокарты (по умолчанию — годовое / от первой отметки). */
  heatmapWindow?: HabitHeatmapWindow;
  /** Прозрачность пустой ячейки в диапазоне (по умолчанию 0.1). */
  emptyOpacity?: number;
  /** Прозрачность ячейки вне диапазона (по умолчанию 0.06). */
  outOfRangeOpacity?: number;
}

type DotCell = { key: string; inRange: boolean; done: boolean };

type FitState = {
  size: number;
  weekCount: number;
};

export const DotGrid = ({
  completions,
  color,
  dotSize = 7,
  gap = 3,
  className,
  adaptive = false,
  heatmapWindow = { mode: "default" },
  emptyOpacity = 0.1,
  outOfRangeOpacity = 0.06,
}: DotGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<FitState>({
    size: dotSize,
    weekCount: 0,
  });

  const weekColumns = useMemo(() => {
    const { gridStartMonday, rangeStart, endDate } = getHabitHeatmapUtcRange(
      completions,
      heatmapWindow,
    );
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
  }, [completions, heatmapWindow]);

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

      // Квадратные ячейки от высоты — никогда не растягиваем в полоски.
      const sizeFromH = Math.max(4, Math.floor((h - gap * 6) / 7));
      const maxWeeksByWidth = Math.max(
        1,
        Math.floor((w + gap) / (sizeFromH + gap)),
      );
      const available = Math.max(1, weekColumns.length);
      const next: FitState = {
        size: sizeFromH,
        weekCount: Math.min(available, maxWeeksByWidth),
      };
      setFit((prev) =>
        prev.size === next.size && prev.weekCount === next.weekCount
          ? prev
          : next,
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [adaptive, gap, dotSize, weekColumns.length]);

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
          ? "flex items-center justify-end overflow-hidden"
          : "overflow-x-auto pb-1.5 [scrollbar-width:thin]",
        className,
      )}
    >
      <div
        className={cn("grid shrink-0", !adaptive && "w-max")}
        style={
          adaptive
            ? {
                gridAutoFlow: "column",
                gridTemplateRows: `repeat(7, ${size}px)`,
                gridTemplateColumns: `repeat(${Math.max(1, visibleWeeks.length)}, ${size}px)`,
                columnGap: gap,
                rowGap: gap,
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
            className="shrink-0 rounded-[2px] transition-colors"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              opacity: dot.inRange
                ? dot.done
                  ? 1
                  : emptyOpacity
                : outOfRangeOpacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};
