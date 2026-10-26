import { useMemo, type ReactNode } from "react";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHabitStore } from "@/entities/habit";
import { computeHabitStatsSummary } from "@/features/habitStats";
import { DotGrid } from "@/shared/ui/habitDotGrid/DotGrid";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Card } from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";

export const StatsPage = () => {
  const navigate = useNavigate();
  const habits = useHabitStore((s) => s.habits);

  const stats = useMemo(() => computeHabitStatsSummary(habits), [habits]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex shrink-0 items-center border-b border-border px-4 py-3.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <BackIcon />
        </Button>
        <div className="flex-1 text-center text-lg font-semibold">
          Статистика
        </div>
        <div className="size-8" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {stats.activeCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-muted-foreground">Пока нечего считать</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Добавьте привычку и отмечайте дни — здесь появятся серии и процент
              выполнения.
            </p>
            <Button
              type="button"
              className="mt-3"
              onClick={() => navigate("/add")}
            >
              Добавить привычку
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <section
              className="grid grid-cols-2 gap-2.5"
              aria-label="Сводка"
            >
              <MetricCard
                label="Сегодня"
                value={`${stats.doneToday}/${stats.activeCount}`}
                hint={`${stats.rateToday}%`}
              />
              <MetricCard
                label="За 7 дней"
                value={`${stats.rateLast7}%`}
                hint="всех отметок"
              />
              <MetricCard
                label="Лучшая серия"
                value={String(stats.bestStreak)}
                hint="дней подряд"
                icon={<Flame className="size-3.5 text-orange-500" aria-hidden />}
              />
              <MetricCard
                label="Всего отметок"
                value={String(stats.totalFilledAllTime)}
                hint="за всё время"
              />
            </section>

            <section aria-label="Активность за неделю">
              <h2 className="mb-2.5 text-[13px] font-medium text-muted-foreground">
                Неделя
              </h2>
              <Card className="gap-0 border p-3.5 shadow-none">
                <div className="flex items-end gap-1.5">
                  {stats.dayBars.map((day) => (
                    <div
                      key={day.key}
                      className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                    >
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {day.filled}
                      </span>
                      <div className="flex h-16 w-full items-end justify-center">
                        <div
                          className={cn(
                            "w-full max-w-7 rounded-md bg-chart-1 transition-[height]",
                            day.rate === 0 && "bg-muted",
                          )}
                          style={{
                            height: `${Math.max(day.rate === 0 ? 8 : day.rate, 8)}%`,
                            opacity: day.rate === 0 ? 1 : 0.35 + (day.rate / 100) * 0.65,
                          }}
                          title={`${day.filled} из ${day.total}`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <section aria-label="По привычкам">
              <h2 className="mb-2.5 text-[13px] font-medium text-muted-foreground">
                По привычкам · 30 дней
              </h2>
              <ul className="flex flex-col gap-2.5">
                {stats.habits.map((row) => (
                  <li key={row.habit.id}>
                    <Card className="gap-0 border p-0 shadow-none">
                      <div className="flex flex-col gap-2.5 px-3.5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex size-10 shrink-0 items-center justify-center rounded-2xl"
                            style={{
                              backgroundColor: `${row.habit.color}22`,
                            }}
                          >
                            <HabitIcon
                              name={row.habit.icon}
                              color={row.habit.color}
                              size={18}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">
                              {row.habit.name}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                              <span className="tabular-nums">
                                {row.rateLast30}% · {row.filledLast30}/30
                              </span>
                              {row.streak > 0 ? (
                                <span className="inline-flex items-center gap-0.5 tabular-nums">
                                  <Flame
                                    className="size-3 text-orange-500"
                                    aria-hidden
                                  />
                                  {row.streak}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div
                            className="shrink-0 text-lg font-semibold tabular-nums text-foreground"
                            aria-label={`Выполнение ${row.rateLast30} процентов`}
                          >
                            {row.rateLast30}%
                          </div>
                        </div>
                        <div className="h-12 w-full min-w-0">
                          <DotGrid
                            completions={row.habit.completions}
                            color={row.habit.color}
                            adaptive
                            gap={2}
                            heatmapWindow={{ mode: "days", days: 30 }}
                          />
                        </div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="gap-0 border p-3 shadow-none">
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-1 text-xl font-semibold tabular-nums tracking-tight">
        {icon}
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
    </Card>
  );
}

function BackIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
