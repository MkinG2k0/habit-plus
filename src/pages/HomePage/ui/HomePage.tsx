import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHabitStore } from "@/entities/habit";
import {
  buildHomeCategoryFilterChips,
  categoryFiltersEqual,
  habitMatchesCategoryFilter,
  type HabitCategoryFilter,
} from "@/features/habitCategories";
import { HabitDetailDrawer } from "@/features/habitDetail";
import { useLastNDays, useTodayKey } from "@/shared/lib/habitDates";
import { Badge } from "@/shared/ui/shadCNComponents/ui/badge";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  HabitBottomNav,
  HabitCard,
  HabitCategoryFilterBar,
  HabitListRow,
  HabitMiniCard,
  HabitTopBar,
} from "@/widgets";

export const HomePage = () => {
  const navigate = useNavigate();
  const { habits, viewMode, setViewMode, toggleToday } = useHabitStore();
  const today = useTodayKey();
  const last5 = useLastNDays(5);
  const [categoryFilter, setCategoryFilter] = useState<HabitCategoryFilter>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const detailCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const filterChips = useMemo(
    () => buildHomeCategoryFilterChips(habits),
    [habits],
  );

  useEffect(() => {
    if (categoryFilter === null) return;
    const stillValid = filterChips.some((c) =>
      categoryFiltersEqual(categoryFilter, c.filter),
    );
    if (!stillValid) setCategoryFilter(null);
  }, [categoryFilter, filterChips]);

  const filteredHabits = useMemo(
    () => habits.filter((h) => habitMatchesCategoryFilter(h, categoryFilter)),
    [habits, categoryFilter],
  );

  const detailHabit = habits.find((h) => h.id === detailId) ?? null;

  const openDetail = useCallback((id: number) => {
    if (detailCloseTimerRef.current) {
      clearTimeout(detailCloseTimerRef.current);
      detailCloseTimerRef.current = null;
    }
    setDetailId(id);
    setIsDetailDrawerOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailDrawerOpen(false);
    if (detailCloseTimerRef.current) {
      clearTimeout(detailCloseTimerRef.current);
    }
    detailCloseTimerRef.current = setTimeout(() => {
      setDetailId(null);
      detailCloseTimerRef.current = null;
    }, 320);
  }, []);

  const drawerOpen = isDetailDrawerOpen && detailHabit !== null;

  return (
    <>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <HabitTopBar />

        <HabitCategoryFilterBar
          habits={habits}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />

        {viewMode === "list" ? (
          <div className="flex shrink-0 items-center gap-2 px-4 pb-2.5">
            <Badge
              variant="secondary"
              className="rounded-lg border-0 px-3 py-1.5 text-[13px] font-medium text-foreground"
            >
              Последние 5 дней
            </Badge>
            <div className="flex-1" />
            <div className="flex gap-1">
              {last5.map((d) => (
                <div key={d.key} className="w-7 text-center">
                  <div className="text-[11px] text-muted-foreground">
                    {d.label}
                  </div>
                  <div
                    className={
                      d.isToday
                        ? "text-sm font-bold text-foreground"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {d.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-muted-foreground">
                Добавьте первую привычку, чтобы начать трекинг.
              </p>
              <Button type="button" onClick={() => navigate("/add")}>
                Новая привычка
              </Button>
            </div>
          ) : filteredHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-muted-foreground">
                Нет привычек в выбранной категории.
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCategoryFilter(null)}
              >
                Показать все
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="flex flex-col gap-2.5">
              {filteredHabits.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  isDoneToday={h.completions[today] ?? false}
                  onToggle={() => toggleToday(h.id)}
                  onOpen={() => openDetail(h.id)}
                />
              ))}
            </div>
          ) : viewMode === "list" ? (
            <div className="flex flex-col gap-2.5">
              {filteredHabits.map((h) => (
                <HabitListRow
                  key={h.id}
                  habit={h}
                  days={last5}
                  onToggle={() => toggleToday(h.id)}
                  onOpen={() => openDetail(h.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-2.5">
              {filteredHabits.map((h) => (
                <HabitMiniCard
                  key={h.id}
                  habit={h}
                  onOpen={() => openDetail(h.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 px-4 pb-4">
          <HabitBottomNav view={viewMode} onView={setViewMode} />
        </div>
      </div>

      <HabitDetailDrawer
        habit={detailHabit}
        open={drawerOpen}
        onOpenChange={(open) => {
          if (open) setIsDetailDrawerOpen(true);
          else closeDetail();
        }}
        onEdit={(h) => {
          setIsDetailDrawerOpen(false);
          if (detailCloseTimerRef.current) {
            clearTimeout(detailCloseTimerRef.current);
          }
          detailCloseTimerRef.current = setTimeout(() => {
            setDetailId(null);
            detailCloseTimerRef.current = null;
            navigate(`/edit/${h.id}`);
          }, 280);
        }}
        onOpenReminders={(h) => {
          setIsDetailDrawerOpen(false);
          if (detailCloseTimerRef.current) {
            clearTimeout(detailCloseTimerRef.current);
          }
          detailCloseTimerRef.current = setTimeout(() => {
            setDetailId(null);
            detailCloseTimerRef.current = null;
            navigate(`/edit/${h.id}/reminders`);
          }, 280);
        }}
      />
    </>
  );
};
