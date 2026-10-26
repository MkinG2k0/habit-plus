import { forwardRef, useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  HABIT_PRESET_CATEGORY_COLORS,
  HABIT_PRESET_CATEGORY_LABELS,
  HABIT_TEMPLATE_CATEGORY_IDS,
} from "@/entities/habit";
import { PresetCategoryIcon } from "@/features/habitCategories";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/shadCNComponents/ui/chart";
import type { SphereScore } from "../lib/scoreQuiz";

interface SphereAttentionDonutProps {
  scores: readonly SphereScore[];
  /** Показать дату (для карточки скачивания). */
  showDate?: boolean;
}

export const SphereAttentionDonut = forwardRef<
  HTMLDivElement,
  SphereAttentionDonutProps
>(function SphereAttentionDonut({ scores, showDate = false }, ref) {
  const orderedScores = useMemo(() => {
    const byId = new Map(scores.map((s) => [s.sphereId, s]));
    return HABIT_TEMPLATE_CATEGORY_IDS.flatMap((id) => {
      const score = byId.get(id);
      return score ? [score] : [];
    });
  }, [scores]);

  const chartData = useMemo(
    () =>
      orderedScores.map((s) => ({
        sphereId: s.sphereId,
        name: HABIT_PRESET_CATEGORY_LABELS[s.sphereId],
        value: Math.max(s.attentionPercent, 1),
        percent: s.attentionPercent,
        fill: HABIT_PRESET_CATEGORY_COLORS[s.sphereId],
      })),
    [orderedScores],
  );

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const s of orderedScores) {
      config[s.sphereId] = {
        label: HABIT_PRESET_CATEGORY_LABELS[s.sphereId],
        color: HABIT_PRESET_CATEGORY_COLORS[s.sphereId],
      };
    }
    return config;
  }, [orderedScores]);

  const average = useMemo(() => {
    if (orderedScores.length === 0) return 0;
    const sum = orderedScores.reduce((acc, s) => acc + s.attentionPercent, 0);
    return Math.round(sum / orderedScores.length);
  }, [orderedScores]);

  const dateLabel = useMemo(() => {
    if (!showDate) return null;
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
  }, [showDate]);

  return (
    <div
      ref={ref}
      className="space-y-4 rounded-xl bg-background p-3"
    >
      <div className="relative mx-auto w-full max-w-[260px]">
        <ChartContainer
          config={chartConfig}
          className="aspect-square h-auto w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey="name"
                  hideLabel
                  formatter={(value, _name, item) => {
                    const percent =
                      typeof item?.payload?.percent === "number"
                        ? item.payload.percent
                        : value;
                    return (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {percent}%
                      </span>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="90%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.sphereId} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums text-foreground">
            {average}%
          </span>
          <span className="text-xs text-muted-foreground">в среднем</span>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
        {orderedScores.map((score) => {
          const label = HABIT_PRESET_CATEGORY_LABELS[score.sphereId];
          const accent = HABIT_PRESET_CATEGORY_COLORS[score.sphereId];
          return (
            <li
              key={score.sphereId}
              className="flex min-w-0 items-center gap-2 text-sm"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <PresetCategoryIcon
                id={score.sphereId}
                className="size-3.5 shrink-0 text-muted-foreground"
                size={14}
              />
              <span className="min-w-0 flex-1 truncate text-foreground">
                {label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {score.attentionPercent}%
              </span>
            </li>
          );
        })}
        {dateLabel ? (
          <li className="col-span-2 pt-1 text-xs text-muted-foreground">
            Дата: {dateLabel}
          </li>
        ) : null}
      </ul>
    </div>
  );
});
