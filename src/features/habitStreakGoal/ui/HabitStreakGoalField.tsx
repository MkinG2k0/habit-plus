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
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { cn } from "@/shared/ui/lib/utils";
import { formatStreakGoalSummary } from "../lib/formatStreakGoalSummary";

const STREAK_PRESETS = [7, 14, 21, 30, 60, 90, 100] as const;
const STREAK_PRESET_SET = new Set<number>(STREAK_PRESETS);

interface HabitStreakGoalFieldProps {
  value: number | undefined;
  onChange: (next: number | undefined) => void;
}

export const HabitStreakGoalField = ({
  value,
  onChange,
}: HabitStreakGoalFieldProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number | undefined>(value);
  const [customRaw, setCustomRaw] = useState("");
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const customRawRef = useRef(customRaw);
  customRawRef.current = customRaw;

  useEffect(() => {
    if (open) {
      setDraft(value);
      setCustomRaw(
        value != null && value > 0 && !STREAK_PRESET_SET.has(value)
          ? String(value)
          : "",
      );
    }
  }, [open, value]);

  const resolveDraftOnClose = (): number | undefined => {
    const raw = customRawRef.current.trim();
    if (raw !== "") {
      const parsed = Number.parseInt(raw, 10);
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 9999) {
        return parsed;
      }
    }
    return draftRef.current;
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onChange(resolveDraftOnClose());
    }
    setOpen(next);
  };

  const summary = formatStreakGoalSummary(value);

  const applyCustom = () => {
    const parsed = Number.parseInt(customRaw.trim(), 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 9999) {
      setDraft(parsed);
    }
  };

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
              Задайте, сколько дней подряд хотите держать серию. Можно оставить
              без цели.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Без цели
              </p>
              <button
                type="button"
                onClick={() => {
                  setDraft(undefined);
                  setCustomRaw("");
                }}
                className={cn(
                  "mt-2 w-full rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                  draft == null
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted/40",
                )}
                aria-pressed={draft == null}
              >
                Нет
              </button>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Пресеты
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STREAK_PRESETS.map((d) => {
                  const selected = draft === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDraft(d);
                        setCustomRaw("");
                      }}
                      className={cn(
                        "rounded-full border px-3 py-2 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-card text-foreground hover:bg-muted/40",
                      )}
                      aria-pressed={selected}
                    >
                      {d} дн.
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Своё значение
              </p>
              <div className="mt-2 flex gap-2">
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Например, 45"
                  value={customRaw}
                  onChange={(e) => setCustomRaw(e.target.value.replace(/\D/g, ""))}
                  className="h-11 min-w-0 flex-1 rounded-lg"
                  maxLength={4}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 shrink-0 px-4"
                  onClick={applyCustom}
                >
                  ОК
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                От 1 до 9999 дней
              </p>
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
