import type { Habit } from "@/entities/habit";
import {
  buildHomeCategoryFilterChips,
  categoryFiltersEqual,
  CustomCategoryLucideIcon,
  PresetCategoryIcon,
  type HabitCategoryFilter,
} from "@/features/habitCategories";
import { cn } from "@/shared/ui/lib/utils";

interface HabitCategoryFilterBarProps {
  habits: Habit[];
  value: HabitCategoryFilter;
  onChange: (next: HabitCategoryFilter) => void;
}

const findCustomIconName = (habits: Habit[], customId: string) => {
  for (const h of habits) {
    for (const t of h.categoryTags ?? []) {
      if (t.type === "custom" && t.id === customId) return t.iconName;
    }
  }
  return undefined;
};

export const HabitCategoryFilterBar = ({
  habits,
  value,
  onChange,
}: HabitCategoryFilterBarProps) => {
  const chips = buildHomeCategoryFilterChips(habits);

  if (chips.length <= 1) return null;

  return (
    <div className="shrink-0 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur-sm">
      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Фильтр по категориям"
      >
        {chips.map((chip) => {
          const selected = categoryFiltersEqual(value, chip.filter);
          const isPreset =
            chip.filter !== null && chip.filter.kind === "preset";
          const isCustom =
            chip.filter !== null && chip.filter.kind === "custom";
          const customIconName =
            isCustom && chip.filter.kind === "custom"
              ? findCustomIconName(habits, chip.filter.id)
              : undefined;

          return (
            <button
              key={chip.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(chip.filter)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                selected
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {isPreset ? (
                <PresetCategoryIcon
                  id={chip.filter.id}
                  size={14}
                  className="text-foreground"
                />
              ) : null}
              {isCustom && customIconName ? (
                <CustomCategoryLucideIcon
                  name={customIconName}
                  size={14}
                  className="text-foreground"
                />
              ) : null}
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
