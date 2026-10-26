import { forwardRef, useMemo } from "react";
import {
  HABIT_PRESET_CATEGORY_COLORS,
  HABIT_PRESET_CATEGORY_LABELS,
  HABIT_TEMPLATE_CATEGORY_IDS,
} from "@/entities/habit";
import { PresetCategoryIcon } from "@/features/habitCategories";
import type { SphereScore } from "../lib/scoreQuiz";

interface SphereAttentionDonutProps {
  scores: readonly SphereScore[];
  /** Показать дату (для карточки скачивания). */
  showDate?: boolean;
}

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = SIZE * 0.45;
const INNER_R = SIZE * 0.29;
const GAP_DEG = 2;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function donutArcPath(
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0) return "";

  const large = sweep > 180 ? 1 : 0;
  const o1 = polar(CX, CY, OUTER_R, startAngle);
  const o2 = polar(CX, CY, OUTER_R, endAngle);
  const i2 = polar(CX, CY, INNER_R, endAngle);
  const i1 = polar(CX, CY, INNER_R, startAngle);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${i1.x} ${i1.y}`,
    "Z",
  ].join(" ");
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

  const slices = useMemo(() => {
    const weights = orderedScores.map((s) => Math.max(s.attentionPercent, 1));
    const total = weights.reduce((a, b) => a + b, 0);
    if (total <= 0 || orderedScores.length === 0) return [];

    const gapTotal = GAP_DEG * orderedScores.length;
    const usable = Math.max(360 - gapTotal, 1);
    let cursor = 0;

    return orderedScores.map((s, i) => {
      const sweep = (weights[i]! / total) * usable;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end + GAP_DEG;
      return {
        sphereId: s.sphereId,
        name: HABIT_PRESET_CATEGORY_LABELS[s.sphereId],
        percent: s.attentionPercent,
        fill: HABIT_PRESET_CATEGORY_COLORS[s.sphereId],
        d: donutArcPath(start, end),
      };
    });
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
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="aspect-square h-auto w-full"
          role="img"
          aria-label={`Среднее внимание ${average}%`}
        >
          {slices.map((slice) => (
            <path
              key={slice.sphereId}
              d={slice.d}
              fill={slice.fill}
            >
              <title>
                {slice.name}: {slice.percent}%
              </title>
            </path>
          ))}
        </svg>

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
