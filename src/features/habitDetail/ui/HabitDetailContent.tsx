import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Habit } from "@/entities/habit";
import { useHabitStore } from "@/entities/habit";
import { DotGrid } from "@/shared/ui/habitDotGrid/DotGrid";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { cn } from "@/shared/ui/lib/utils";
import type { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Separator } from "@radix-ui/react-separator";

const MONTH_NAMES_RU = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];
const DAY_NAMES_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface HabitDetailContentProps {
  habit: Habit;
  onClose: () => void;
  onEdit: () => void;
  onOpenReminders?: () => void;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function calendarMonthDiff(fromMonthStart: Date, toMonthStart: Date): number {
  return (
    (toMonthStart.getFullYear() - fromMonthStart.getFullYear()) * 12 +
    (toMonthStart.getMonth() - fromMonthStart.getMonth())
  );
}

const CALENDAR_SWIPER_SPEED = 280;

/** Локальная дата YYYY-MM-DD (как в completions). */
function formatLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 6 недель × 7 дней с понедельника: хвост прошлого месяца + месяц + начало следующего. */
/** Фон отмеченного дня: тот же оттенок привычки, но темнее (число дня без изменений). */
function habitDoneCellBackground(habitColor: string): string {
  return `color-mix(in oklab, ${habitColor} 60%, black)`;
}

function buildSixWeekCells(
  year: number,
  month: number,
): { date: Date; inCurrentMonth: boolean }[] {
  const firstWeekdayMon0 = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: { date: Date; inCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - firstWeekdayMon0 + i);
    cells.push({
      date,
      inCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
    });
  }
  return cells;
}

export const HabitDetailContent = ({
  habit,
  onClose,
  onEdit,
  onOpenReminders,
}: HabitDetailContentProps) => {
  const toggleDateCompletion = useHabitStore((s) => s.toggleDateCompletion);
  const [centerMonth, setCenterMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const swiperRef = useRef<SwiperClass | null>(null);
  const shouldRecenterSwiperRef = useRef(false);
  const jumpToTodayRef = useRef<{
    remaining: number;
    direction: 1 | -1;
  } | null>(null);

  useEffect(() => {
    jumpToTodayRef.current = null;
    setCenterMonth(startOfMonth(new Date()));
  }, [habit.id]);

  useLayoutEffect(() => {
    if (!shouldRecenterSwiperRef.current) return;
    shouldRecenterSwiperRef.current = false;
    swiperRef.current?.slideTo(1, 0, false);
  }, [centerMonth]);

  const monthLabel = `${MONTH_NAMES_RU[centerMonth.getMonth()] ?? ""} ${centerMonth.getFullYear()}`;

  const handleSlideChangeEnd = useCallback((sw: SwiperClass) => {
    if (sw.activeIndex === 0) {
      shouldRecenterSwiperRef.current = true;
      setCenterMonth((c) => addMonths(c, -1));
    } else if (sw.activeIndex === 2) {
      shouldRecenterSwiperRef.current = true;
      setCenterMonth((c) => addMonths(c, 1));
    }

    const jump = jumpToTodayRef.current;
    if (
      jump &&
      (sw.activeIndex === 0 || sw.activeIndex === 2) &&
      jump.remaining > 0
    ) {
      jump.remaining -= 1;
      if (jump.remaining <= 0) {
        jumpToTodayRef.current = null;
        return;
      }
      const dir = jump.direction;
      queueMicrotask(() => {
        const instance = swiperRef.current;
        if (!instance || !jumpToTodayRef.current) return;
        if (dir === 1) instance.slideNext();
        else instance.slidePrev();
      });
    }
  }, []);

  const goPrevMonth = useCallback(() => {
    jumpToTodayRef.current = null;
    swiperRef.current?.slidePrev();
  }, []);

  const goNextMonth = useCallback(() => {
    jumpToTodayRef.current = null;
    swiperRef.current?.slideNext();
  }, []);

  const goToCurrentMonth = useCallback(() => {
    const sw = swiperRef.current;
    if (!sw) return;

    const target = startOfMonth(new Date());
    const diff = calendarMonthDiff(centerMonth, target);

    if (diff === 0) {
      sw.slideTo(1, CALENDAR_SWIPER_SPEED, false);
      return;
    }

    jumpToTodayRef.current = {
      remaining: Math.abs(diff),
      direction: diff > 0 ? 1 : -1,
    };

    requestAnimationFrame(() => {
      const instance = swiperRef.current;
      if (!instance || !jumpToTodayRef.current) return;
      if (diff > 0) instance.slideNext();
      else instance.slidePrev();
    });
  }, [centerMonth]);

  return (
    <div className="flex max-h-[88dvh] gap-4 m-2 flex-col overflow-y-auto rounded-3xl border border-border bg-card px-4 pb-8 pt-5 text-card-foreground">
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${habit.color}22` }}
        >
          <HabitIcon name={habit.icon} color={habit.color} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-foreground">{habit.name}</div>
          <div className="text-sm text-muted-foreground">
            {habit.desc || "Нет описания"}
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-8 shrink-0 rounded-lg"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <CloseIcon />
        </Button>
      </div>

      <DotGrid
        completions={habit.completions}
        color={habit.color}
        dotSize={8}
        gap={3}
      />

      <div className=" flex items-center gap-2">
        <Chip>Нет цели серии</Chip>
        <Chip>💧 0</Chip>
        <div className="flex-1" />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-9 rounded-lg border border-border"
          onClick={onEdit}
          aria-label="Редактировать"
        >
          <EditIcon />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-9 rounded-lg border border-border"
          onClick={onOpenReminders}
          disabled={!onOpenReminders}
          aria-label="Напоминания и настройки привычки"
        >
          <SettingsSmIcon />
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES_RU.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <Swiper
        key={habit.id}
        className="habit-calendar-swiper w-full overflow-hidden"
        slidesPerView={1}
        spaceBetween={0}
        initialSlide={1}
        speed={CALENDAR_SWIPER_SPEED}
        resistanceRatio={0.85}
        threshold={14}
        touchAngle={60}
        onSwiper={(instance) => {
          swiperRef.current = instance;
        }}
        onTouchStart={() => {
          jumpToTodayRef.current = null;
        }}
        onSlideChangeTransitionEnd={handleSlideChangeEnd}
      >
        {[-1, 0, 1].map((delta) => {
          const viewMonth = addMonths(centerMonth, delta);
          const y = viewMonth.getFullYear();
          const m = viewMonth.getMonth();
          return (
            <SwiperSlide key={delta}>
              <MonthDayGrid
                habit={habit}
                year={y}
                month={m}
                onToggleDay={(dateStr) =>
                  toggleDateCompletion(habit.id, dateStr)
                }
              />
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className=" flex items-center">
        <Button
          type="button"
          variant="secondary"
          className="h-9 shrink-0 gap-2 rounded-lg border border-border px-3 font-normal"
          onClick={goToCurrentMonth}
          aria-label="Перейти к текущему месяцу"
        >
          <CalendarIcon />
          <span className="text-sm text-foreground">{monthLabel}</span>
        </Button>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-9 rounded-lg border border-border text-lg"
            onClick={goPrevMonth}
            aria-label="Предыдущий месяц"
          >
            ‹
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-9 rounded-lg border border-border text-lg"
            onClick={goNextMonth}
            aria-label="Следующий месяц"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
};

function MonthDayGrid({
  habit,
  year,
  month,
  onToggleDay,
}: {
  habit: Habit;
  year: number;
  month: number;
  onToggleDay: (dateStr: string) => void;
}) {
  const cells = buildSixWeekCells(year, month);
  const today = new Date();

  return (
    <div className="grid grid-cols-7 grid-rows-6 gap-1">
      {cells.map(({ date, inCurrentMonth }) => {
        const dateStr = formatLocalDateStr(date);
        const done = habit.completions[dateStr] ?? false;
        const isToday =
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();

        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onToggleDay(dateStr)}
            className={cn(
              "flex h-9 items-center justify-center rounded-md border border-transparent text-sm transition-colors",
              "cursor-pointer touch-manipulation",
              !done && "hover:bg-muted/80 active:bg-muted",
              !done &&
                (inCurrentMonth ? "text-foreground" : "text-muted-foreground"),
              isToday && !done && "bg-muted",
              done && "font-medium text-white",
              isToday &&
                done &&
                "font-bold ring-2 ring-background ring-offset-1 ring-offset-card",
            )}
            style={
              done
                ? { backgroundColor: habitDoneCellBackground(habit.color) }
                : undefined
            }
            aria-label={
              done
                ? `Снять отметку ${dateStr}`
                : `Отметить выполнение ${dateStr}`
            }
            aria-pressed={done}
          >
            {date.getDate()}
          </button>
        );
      })}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-muted px-3.5 py-2">
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="text-muted-foreground"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SettingsSmIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
