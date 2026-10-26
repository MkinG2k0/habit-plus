import { useEffect, useRef, useState } from "react";
import { Share as ShareIcon, XIcon } from "lucide-react";
import { HABIT_COLOR_OPTIONS, type Habit } from "@/entities/habit";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import { cn } from "@/shared/ui/lib/utils";
import { downloadOrShareHabitCard } from "../lib/downloadOrShareHabitCard";
import {
  HABIT_SHARE_RANGE_OPTIONS,
  type HabitShareRangeId,
} from "../model/shareRange";
import { useHabitSharePrefsStore } from "../slice/habitSharePrefsStore";
import {
  HabitShareCard,
  type HabitShareCardTheme,
} from "./HabitShareCard";

interface HabitShareDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AppearanceSwitch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full bg-background shadow-sm transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

export const HabitShareDialog = ({
  habit,
  open,
  onOpenChange,
}: HabitShareDialogProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<HabitShareCardTheme>("dark");
  const [accentColor, setAccentColor] = useState(
    () => habit?.color ?? HABIT_COLOR_OPTIONS[1]!,
  );
  const [showCompletionIndicator, setShowCompletionIndicator] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const range = useHabitSharePrefsStore((s) => s.range);
  const setRange = useHabitSharePrefsStore((s) => s.setRange);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !habit) return;
    setAccentColor(habit.color);
    setTheme("dark");
    setShowCompletionIndicator(false);
    setShowDescription(Boolean(habit.desc.trim()));
    setShareError(null);
    setIsSharing(false);
  }, [open, habit]);

  const handleShare = async () => {
    if (!habit || !cardRef.current || isSharing) return;
    setIsSharing(true);
    setShareError(null);
    try {
      await downloadOrShareHabitCard(
        cardRef.current,
        habit.name,
        accentColor,
      );
    } catch {
      setShareError("Не удалось сохранить изображение. Попробуйте ещё раз.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[60]"
        className="z-[60] flex h-[min(96dvh,900px)] max-h-[96dvh] w-full max-w-md flex-col gap-0 overflow-hidden rounded-3xl border-border bg-background p-0 text-foreground shadow-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-xl"
            onClick={() => onOpenChange(false)}
            aria-label="Закрыть"
          >
            <XIcon className="size-5" />
          </Button>
          <DialogTitle className="flex-1 text-center text-base font-semibold">
            Поделиться
          </DialogTitle>
          <DialogDescription className="sr-only">
            Настройте карточку привычки и сохраните изображение
          </DialogDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-xl"
            onClick={() => void handleShare()}
            disabled={!habit || isSharing}
            aria-label="Поделиться изображением"
          >
            <ShareIcon className="size-5" />
          </Button>
        </div>

        {habit ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <div ref={cardRef} className="mx-auto w-full max-w-sm">
              <HabitShareCard
                habit={habit}
                accentColor={accentColor}
                theme={theme}
                showCompletionIndicator={showCompletionIndicator}
                showDescription={showDescription}
                range={range}
              />
            </div>

            <div className="mt-3 rounded-2xl border border-border bg-card p-3 text-card-foreground">
              <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Внешний вид
              </div>

              <label className="mt-2 block">
                <span className="mb-1 block text-sm text-foreground">
                  Диапазон
                </span>
                <select
                  value={range}
                  onChange={(e) =>
                    setRange(e.target.value as HabitShareRangeId)
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Диапазон теплокарты"
                >
                  {HABIT_SHARE_RANGE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div
                className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
                role="group"
                aria-label="Тема карточки"
              >
                {(
                  [
                    ["light", "Светлая"],
                    ["dark", "Тёмная"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={theme === value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "rounded-lg py-2 text-sm font-medium transition-colors",
                      theme === value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-9 gap-2">
                {HABIT_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    className={cn(
                      "aspect-square rounded-full transition-[outline]",
                      accentColor === c &&
                        "outline-2 outline-offset-2 outline-foreground",
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Цвет ${c}`}
                    aria-pressed={accentColor === c}
                  />
                ))}
              </div>

              <div className="mt-4 space-y-1 border-t border-border pt-3">
                <AppearanceSwitch
                  label="Индикатор выполнения"
                  checked={showCompletionIndicator}
                  onCheckedChange={setShowCompletionIndicator}
                />
                <AppearanceSwitch
                  label="Описание"
                  checked={showDescription}
                  onCheckedChange={setShowDescription}
                />
              </div>
            </div>

            {shareError ? (
              <p className="mt-3 text-center text-sm text-destructive">
                {shareError}
              </p>
            ) : null}

            <Button
              type="button"
              className="mt-4 h-11 w-full rounded-xl"
              onClick={() => void handleShare()}
              disabled={isSharing}
            >
              {isSharing ? "Сохранение…" : "Поделиться"}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
