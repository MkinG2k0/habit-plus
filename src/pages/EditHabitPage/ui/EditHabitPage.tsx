import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DEFAULT_HABIT_COLOR,
  HABIT_COLOR_OPTIONS,
  useHabitStore,
  type HabitCategoryTag,
  type HabitIconName,
} from "@/entities/habit";
import { HabitCategoriesField } from "@/features/habitCategories";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Card, CardContent } from "@/shared/ui/shadCNComponents/ui/card";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { cn } from "@/shared/ui/lib/utils";

const ICON_OPTIONS: HabitIconName[] = [
  "health",
  "brain",
  "book",
  "sport",
  "water",
  "meditation",
];

export const EditHabitPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id;

  const { habits, addHabit, updateHabit } = useHabitStore();
  const existing = habits.find((h) => h.id === Number(id));

  const [name, setName] = useState(existing?.name ?? "");
  const [desc, setDesc] = useState(existing?.desc ?? "");
  const [color, setColor] = useState(existing?.color ?? DEFAULT_HABIT_COLOR);
  const [icon, setIcon] = useState<HabitIconName>(existing?.icon ?? "health");
  const [categoryTags, setCategoryTags] = useState<HabitCategoryTag[]>(
    existing?.categoryTags ?? [],
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    if (isNew) {
      addHabit({
        name: name.trim(),
        desc: desc.trim(),
        color,
        icon,
        categoryTags: categoryTags.length ? categoryTags : undefined,
      });
    } else {
      updateHabit(Number(id), {
        name: name.trim(),
        desc: desc.trim(),
        color,
        icon,
        categoryTags: categoryTags.length ? categoryTags : undefined,
      });
    }
    navigate("/");
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
          <CloseIcon />
        </Button>
        <div className="flex-1 text-center text-lg font-semibold">
          {isNew ? "Новая привычка" : "Редактировать привычку"}
        </div>
        <div className="size-8" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="relative mb-5 flex h-[120px] items-center justify-center">
          <div
            className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-3 overflow-hidden opacity-15"
            aria-hidden
          >
            {Array.from({ length: 24 }, (_, i) => {
              const k = ICON_OPTIONS[i % ICON_OPTIONS.length]!;
              return (
                <HabitIcon
                  key={`${k}-bg-${String(i)}`}
                  name={k}
                  color="#fff"
                  size={18}
                />
              );
            })}
          </div>
          <div className="relative z-[1] flex size-[72px] items-center justify-center rounded-full border-2 border-border bg-card">
            <HabitIcon name={icon} color="#fff" size={28} />
          </div>
        </div>

        <div className="mb-5 flex justify-center gap-2.5">
          {ICON_OPTIONS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setIcon(k)}
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl border transition-colors",
                icon === k
                  ? "border-transparent"
                  : "border-border bg-card",
              )}
              style={
                icon === k
                  ? { backgroundColor: `${color}33`, borderColor: color }
                  : undefined
              }
              aria-label={k}
            >
              <HabitIcon
                name={k}
                color={icon === k ? color : "var(--muted-foreground)"}
                size={20}
              />
            </button>
          ))}
        </div>

        <div className="space-y-3.5">
          <div>
            <Label htmlFor="habit-name" className="text-muted-foreground">
              Имя
            </Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 rounded-lg text-[15px]"
            />
          </div>
          <div>
            <Label htmlFor="habit-desc" className="text-muted-foreground">
              Описание
            </Label>
            <Input
              id="habit-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="mt-1.5 h-11 rounded-lg text-[15px]"
            />
          </div>
        </div>

        <div className="mt-3.5">
          <Label className="text-muted-foreground">Цвет</Label>
          <div className="mt-1.5 grid grid-cols-7 gap-2">
            {HABIT_COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-2xl transition-[outline]",
                  color === c && "outline-2 outline-offset-2 outline-foreground",
                )}
                style={{ backgroundColor: c }}
                aria-label={`Цвет ${c}`}
              >
                {color === c ? (
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1 py-2 text-sm text-muted-foreground"
        >
          Дополнительные настройки
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn(
              "transition-transform",
              showAdvanced && "rotate-180",
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showAdvanced ? (
          <div className="mt-2 flex flex-col gap-2.5">
            <div
              className={cn(
                "grid gap-2.5",
                isNew ? "grid-cols-1" : "grid-cols-2",
              )}
            >
              <AdvField label="Цель серии" value="Нет" />
              {!isNew ? (
                <button
                  type="button"
                  onClick={() => navigate(`/edit/${id}/reminders`)}
                  className="rounded-lg border border-border bg-card px-3 py-2.5 text-left"
                >
                  <div className="text-[11px] text-muted-foreground">
                    Напоминание
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[13px] text-foreground">
                    <span>1 Активных</span>
                    <ChevronIcon />
                  </div>
                </button>
              ) : null}
            </div>
            <div className="col-span-2">
              <HabitCategoriesField
                value={categoryTags}
                onChange={setCategoryTags}
              />
            </div>
            <Card className="border shadow-none">
              <CardContent className="px-3 py-3">
                <div className="mb-2.5 text-sm text-foreground">
                  Как отслеживать выполнения?
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {["Пошагово", "Своё значение"].map((label) => (
                    <div
                      key={label}
                      className={cn(
                        "cursor-pointer rounded-md border border-border py-2 text-center text-sm",
                        label === "Пошагово" && "bg-muted",
                      )}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-center text-xs text-muted-foreground">
                  Увеличивать на 1 с каждым выполнением
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border px-4 pb-5 pt-3">
        <Button
          type="button"
          className="h-[52px] w-full text-base font-semibold"
          disabled={!canSave}
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};

function AdvField({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-3 py-2.5",
        fullWidth && "col-span-2",
      )}
    >
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center justify-between text-[13px] text-foreground">
        <span>{value}</span>
        <ChevronIcon />
      </div>
    </div>
  );
}

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
      className="text-muted-foreground"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
