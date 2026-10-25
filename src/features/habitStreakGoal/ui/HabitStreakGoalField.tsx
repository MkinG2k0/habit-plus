import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/shadCNComponents/ui/drawer";
import { cn } from "@/shared/ui/lib/utils";
import type { HabitStreakInterval } from "@/entities/habit";
import { formatStreakGoalSummary } from "../lib/formatStreakGoalSummary";

const INTERVAL_OPTIONS: { value: HabitStreakInterval; label: string }[] = [
  { value: "none", label: "Нет" },
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Неделя" },
  { value: "monthly", label: "Месяц" },
];

interface HabitStreakGoalFieldProps {
  value: HabitStreakInterval | undefined;
  onChange: (next: HabitStreakInterval) => void;
}

export const HabitStreakGoalField = ({
  value,
  onChange,
}: HabitStreakGoalFieldProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HabitStreakInterval>(value ?? "none");
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (open) {
      setDraft(value ?? "none");
    }
  }, [open, value]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onChange(draftRef.current);
    }
    setOpen(next);
  };

  const summary = formatStreakGoalSummary(value);

  const handleDone = () => {
    handleOpenChange(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className={cn(
          "rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors w-full",
          "hover:bg-muted/40 active:bg-muted/60",
        )}
      >
        <div className="text-[11px] text-muted-foreground">Цель серии</div>
        <div className="mt-0.5 flex items-center justify-between text-[13px] text-foreground">
          <span className="line-clamp-1 pr-2">{summary}</span>
          <ChevronIcon />
        </div>
      </button>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-lg">Цель серии</DrawerTitle>
            <DrawerDescription className="text-left">
              Как часто нужно отмечать привычку, чтобы считать серию. Если
              пропустить период, счётчик серии сбрасывается.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
            <p className="text-xs font-medium text-muted-foreground">Интервал</p>
            <div
              className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
              role="listbox"
              aria-label="Интервал цели серии"
            >
              {INTERVAL_OPTIONS.map((opt) => {
                const selected = draft === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setDraft(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-3.5 text-left text-sm text-foreground transition-colors",
                      "hover:bg-muted/50 active:bg-muted/70",
                    )}
                  >
                    <span>{opt.label}</span>
                    {selected ? <CheckIcon /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <Button
              type="button"
              className="h-12 w-full text-base font-semibold"
              onClick={handleDone}
            >
              Готово
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

function ChevronIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CheckIcon() {
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
      className="shrink-0 text-foreground"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
