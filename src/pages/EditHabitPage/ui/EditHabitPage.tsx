import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DEFAULT_HABIT_COLOR,
  foregroundOnHabitColor,
  HABIT_COLOR_OPTIONS,
  useHabitStore,
  type HabitCategoryTag,
  type HabitIconId,
  type HabitStreakInterval,
  type HabitTemplate,
} from "@/entities/habit";
import { HabitCategoriesField } from "@/features/habitCategories";
import { formatRemindersSummary } from "@/features/habitReminders";
import { HabitStreakGoalField } from "@/features/habitStreakGoal";
import { HabitIconPickerDrawer } from "@/features/habitIconPicker";
import { HabitTemplatePicker } from "@/features/habitTemplates";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Card, CardContent } from "@/shared/ui/shadCNComponents/ui/card";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { CATEGORY_PICKER_ICONS } from "@/shared/lib/lucidePickerIcons";
import { HabitIcon } from "@/shared/ui/habitIcon/HabitIcon";
import { cn } from "@/shared/ui/lib/utils";

export const EditHabitPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id;

  const { habits, addHabit, updateHabit } = useHabitStore();
  const existing = habits.find((h) => h.id === Number(id));

  const [name, setName] = useState(existing?.name ?? "");
  const [desc, setDesc] = useState(existing?.desc ?? "");
  const [color, setColor] = useState(existing?.color ?? DEFAULT_HABIT_COLOR);
  const [icon, setIcon] = useState<HabitIconId>(existing?.icon ?? "health");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [categoryTags, setCategoryTags] = useState<HabitCategoryTag[]>(
    existing?.categoryTags ?? [],
  );
  const [streakInterval, setStreakInterval] = useState<HabitStreakInterval>(
    existing?.streakInterval ?? "none",
  );
  const [trackingMode, setTrackingMode] = useState<"step" | "custom">(
    existing?.trackingMode === "custom" ? "custom" : "step",
  );
  const [dailyGoalInput, setDailyGoalInput] = useState(
    existing?.dailyGoal != null && existing.dailyGoal > 0
      ? String(existing.dailyGoal)
      : "",
  );

  const bgIconPattern = useMemo(
    () =>
      Array.from({ length: 84 }, (_, i) => {
        const entry = CATEGORY_PICKER_ICONS[i % CATEGORY_PICKER_ICONS.length]!;
        return { Icon: entry.Icon, key: `${String(i)}-${entry.name}` };
      }),
    [],
  );

  const accentLabelColor = useMemo(() => foregroundOnHabitColor(color), [color]);

  const canSave = name.trim().length > 0;

  const handleTemplateSelect = (template: HabitTemplate) => {
    setName(template.name);
    setDesc(template.desc);
    setCategoryTags([{ type: "preset", id: template.categoryId }]);
  };

  const handleSave = () => {
    if (!canSave) return;
    const parsedGoal = Number(dailyGoalInput.replace(",", "."));
    const dailyGoal =
      trackingMode === "custom" &&
      dailyGoalInput.trim() !== "" &&
      Number.isFinite(parsedGoal) &&
      parsedGoal > 0
        ? Math.floor(parsedGoal)
        : undefined;

    const habitPayload = {
      name: name.trim(),
      desc: desc.trim(),
      color,
      icon,
      categoryTags: categoryTags.length ? categoryTags : undefined,
      streakInterval: streakInterval === "none" ? undefined : streakInterval,
      streakGoal: undefined,
      trackingMode,
      dailyGoal,
    };

    if (isNew) {
      addHabit(habitPayload);
    } else {
      updateHabit(Number(id), habitPayload);
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

      <div className="min-h-0 flex-1 flex flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="relative mb-5 flex min-h-[136px] h-[136px] items-center justify-center sm:h-[144px]">
          <div
            className="pointer-events-none absolute inset-0 grid h-full w-full grid-cols-12 grid-rows-[repeat(7,minmax(0,1fr))] gap-0.5 overflow-hidden opacity-[0.14]"
            aria-hidden
          >
            {bgIconPattern.map(({ Icon, key }) => (
              <div
                key={key}
                className="flex min-h-0 min-w-0 items-center justify-center"
              >
                <Icon
                  size={14}
                  strokeWidth={2}
                  fill="none"
                  stroke="currentColor"
                  className="max-h-[90%] max-w-[90%] shrink-0 text-foreground"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIconPickerOpen(true)}
            className="relative z-1 flex size-[72px] cursor-pointer items-center justify-center rounded-full border-2 border-border bg-card transition-colors hover:bg-muted/40 active:bg-muted/60"
            aria-label="Выбрать значок или эмодзи"
          >
            <HabitIcon name={icon} color="#fff" size={28} />
          </button>
        </div>

        <HabitIconPickerDrawer
          open={iconPickerOpen}
          onOpenChange={setIconPickerOpen}
          value={icon}
          onChange={setIcon}
          accentColor={color}
        />

        <div className="space-y-3.5">
          {isNew ? (
            <>
              <button
                type="button"
                onClick={() => setTemplatePickerOpen(true)}
                className={cn(
                  "w-full rounded-lg border border-dashed border-border bg-card px-3 py-2.5 text-left transition-colors",
                  "hover:border-primary/50 hover:bg-muted/40 active:bg-muted/60",
                )}
              >
                <div className="text-[11px] text-muted-foreground">
                  Быстрый старт
                </div>
                <div className="mt-0.5 text-[13px] font-medium text-foreground">
                  Из шаблонов
                </div>
              </button>
              <HabitTemplatePicker
                open={templatePickerOpen}
                onOpenChange={setTemplatePickerOpen}
                onSelect={handleTemplateSelect}
              />
            </>
          ) : null}
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

        <div className="">
          <Label className="text-muted-foreground">Цвет</Label>
          <div className="mt-1.5 grid grid-cols-7 gap-2">
            {HABIT_COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-2xl transition-[outline]",
                  color === c &&
                    "outline-2 outline-offset-2 outline-foreground",
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

        <div className="flex gap-2 flex-col">
          <div className="flex gap-2.5">
            <HabitCategoriesField
              value={categoryTags}
              onChange={setCategoryTags}
            />

            <HabitStreakGoalField
              value={streakInterval}
              onChange={setStreakInterval}
            />
          </div>

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
                <span>
                  {formatRemindersSummary(existing?.reminders)}
                </span>
                <ChevronIcon />
              </div>
            </button>
          ) : null}

          <Card className="border shadow-none">
            <CardContent className="px-3 py-3">
              <div className="mb-2.5 text-sm text-foreground">
                Как отслеживать выполнения?
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTrackingMode("step")}
                  aria-pressed={trackingMode !== "custom"}
                  className={cn(
                    "cursor-pointer rounded-md border py-2 text-center text-sm font-medium transition-[filter,colors]",
                    trackingMode !== "custom"
                      ? "shadow-sm hover:brightness-110 active:brightness-95"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  style={
                    trackingMode !== "custom"
                      ? {
                          backgroundColor: color,
                          borderColor: color,
                          color: accentLabelColor,
                        }
                      : undefined
                  }
                >
                  Пошагово
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingMode("custom")}
                  aria-pressed={trackingMode === "custom"}
                  className={cn(
                    "cursor-pointer rounded-md border py-2 text-center text-sm font-medium transition-[filter,colors]",
                    trackingMode === "custom"
                      ? "shadow-sm hover:brightness-110 active:brightness-95"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  style={
                    trackingMode === "custom"
                      ? {
                          backgroundColor: color,
                          borderColor: color,
                          color: accentLabelColor,
                        }
                      : undefined
                  }
                >
                  Своё значение
                </button>
              </div>
              <p className="mt-1.5 text-center text-xs text-muted-foreground">
                {trackingMode === "custom"
                  ? "При отметке дня вводите своё число (страницы, шаги и т. д.)"
                  : "Увеличивать на 1 с каждым выполнением"}
              </p>
              {trackingMode === "custom" ? (
                <div className="mt-3">
                  <Label
                    htmlFor="habit-daily-goal"
                    className="text-muted-foreground"
                  >
                    Цель на день (для шкалы прогресса)
                  </Label>
                  <Input
                    id="habit-daily-goal"
                    inputMode="numeric"
                    placeholder="Например, 8"
                    value={dailyGoalInput}
                    onChange={(e) => setDailyGoalInput(e.target.value)}
                    className="mt-1.5 h-11 rounded-lg text-[15px]"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-4 pb-5 pt-3">
        <Button
          type="button"
          variant="secondary"
          className="h-[52px] w-full rounded-lg text-base font-semibold transition-[filter] hover:brightness-110 active:brightness-95"
          style={{
            backgroundColor: color,
            borderColor: color,
            color: accentLabelColor,
          }}
          disabled={!canSave}
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </div>
    </div>
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
