import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Card, CardContent } from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const HabitRemindersPage = () => {
  const navigate = useNavigate();
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4]);

  const toggleDay = (i: number) => {
    setActiveDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i],
    );
  };

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
          Напоминание (1/1)
        </div>
        <div className="size-8" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <Card className="border shadow-none">
          <CardContent className="px-3.5 py-3.5">
            <div className="mb-3 text-sm font-semibold text-foreground">
              Напоминание #1
            </div>
            <div className="mb-3 flex gap-1.5">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center rounded-md text-[13px] font-medium text-primary-foreground transition-colors",
                    activeDays.includes(i) ? "bg-chart-1" : "bg-muted",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-muted px-3.5 py-2.5">
                <ClockIcon />
                <span className="font-numeric text-base font-semibold text-foreground">
                  10:00
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-11 shrink-0 rounded-md border border-border"
                aria-label="Удалить напоминание"
              >
                <TrashIcon />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function BackIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-destructive"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
