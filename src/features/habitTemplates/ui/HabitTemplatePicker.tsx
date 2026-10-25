import { useEffect, useMemo, useState } from "react";
import {
  HABIT_PRESET_CATEGORY_LABELS,
  HABIT_TEMPLATE_CATEGORY_IDS,
  getHabitTemplatesByCategory,
  type HabitTemplate,
  type HabitTemplateCategoryId,
} from "@/entities/habit";
import { PresetCategoryIcon } from "@/features/habitCategories";
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

interface HabitTemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: HabitTemplate) => void;
}

export const HabitTemplatePicker = ({
  open,
  onOpenChange,
  onSelect,
}: HabitTemplatePickerProps) => {
  const [categoryId, setCategoryId] = useState<HabitTemplateCategoryId>(
    HABIT_TEMPLATE_CATEGORY_IDS[0],
  );

  useEffect(() => {
    if (open) {
      setCategoryId(HABIT_TEMPLATE_CATEGORY_IDS[0]);
    }
  }, [open]);

  const templates = useMemo(
    () => getHabitTemplatesByCategory(categoryId),
    [categoryId],
  );

  const handleSelect = (template: HabitTemplate) => {
    onSelect(template);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg">Из шаблонов</DrawerTitle>
          <DrawerDescription className="text-left">
            Выберите сферу, затем готовую привычку — название и описание
            подставятся автоматически
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {HABIT_TEMPLATE_CATEGORY_IDS.map((id) => {
              const selected = categoryId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategoryId(id)}
                  className={cn(
                    "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-card text-foreground",
                  )}
                  aria-pressed={selected}
                >
                  <PresetCategoryIcon id={id} size={16} />
                  <span className="min-w-0 truncate">
                    {HABIT_PRESET_CATEGORY_LABELS[id]}
                  </span>
                </button>
              );
            })}
          </div>

          <ul className="mt-4 space-y-2">
            {templates.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(template)}
                  className={cn(
                    "w-full rounded-xl border border-border bg-card px-3.5 py-3 text-left transition-colors",
                    "hover:bg-muted/40 active:bg-muted/60",
                  )}
                >
                  <div className="text-[15px] font-medium text-foreground">
                    {template.name}
                  </div>
                  {template.desc !== template.name ? (
                    <div className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                      {template.desc}
                    </div>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <DrawerFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
