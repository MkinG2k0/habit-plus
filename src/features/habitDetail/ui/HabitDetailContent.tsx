import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Habit } from "@/entities/habit";
import { DotGrid } from "@/shared/ui/habitDotGrid/DotGrid";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Card, CardContent } from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";
import type { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

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

export const HabitDetailContent = ({
  habit,
  onClose,
  onEdit,
  onOpenReminders,
}: HabitDetailContentProps) => {
  const [centerMonth, setCenterMonth] = useState(() => startOfMonth(new Date()));
  const swiperRef = useRef<SwiperClass | null>(null);
  const shouldRecenterSwiperRef = useRef(false);

  useEffect(() => {
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
  }, []);

  const goPrevMonth = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const goNextMonth = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  return (
    <div className="flex max-h-[88dvh] flex-col overflow-y-auto rounded-t-3xl border border-border bg-card px-4 pb-8 pt-5 text-card-foreground">
      <div className="mb-4 flex items-center gap-3">
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

      <Card className="mb-3 border shadow-none">
        <CardContent className="px-3 py-3">
          <DotGrid
            completions={habit.completions}
            color={habit.color}
            dotSize={8}
            gap={3}
          />
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center gap-2">
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

      <Card className="border shadow-none">
        <CardContent className="px-3.5 py-3.5">
          <div className="mb-2.5 grid grid-cols-7 gap-1">
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
            speed={280}
            resistanceRatio={0.85}
            onSwiper={(instance) => {
              swiperRef.current = instance;
            }}
            onSlideChangeTransitionEnd={handleSlideChangeEnd}
          >
            {[-1, 0, 1].map((delta) => {
              const viewMonth = addMonths(centerMonth, delta);
              const y = viewMonth.getFullYear();
              const m = viewMonth.getMonth();
              return (
                <SwiperSlide key={delta}>
                  <MonthDayGrid habit={habit} year={y} month={m} />
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className="mt-3 flex items-center">
            <Chip>📅 {monthLabel}</Chip>
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
        </CardContent>
      </Card>
    </div>
  );
}

function MonthDayGrid({
  habit,
  year,
  month,
}: {
  habit: Habit;
  year: number;
  month: number;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: firstWeekday }, (_, i) => (
        <div key={`cal-pad-${habit.id}-${year}-${month}-${String(i)}`} />
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const done = habit.completions[dateStr] ?? false;
        const isToday =
          day === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear();

        return (
          <div
            key={day}
            className={cn(
              "flex h-9 flex-col items-center justify-center rounded-md",
              isToday && !done && "bg-muted",
              isToday && done && "font-bold text-white",
            )}
            style={
              isToday && done ? { backgroundColor: habit.color } : undefined
            }
          >
            <span
              className={cn(
                "text-sm",
                isToday ? "font-bold" : "font-normal text-foreground",
              )}
            >
              {day}
            </span>
            {done && !isToday ? (
              <div
                className="mt-0.5 size-1.5 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
            ) : null}
          </div>
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
