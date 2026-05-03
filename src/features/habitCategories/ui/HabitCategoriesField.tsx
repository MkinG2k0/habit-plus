import { useEffect, useMemo, useRef, useState } from "react";
import {
  isPresetCategoryId,
  useHabitCategoryCatalogStore,
  type AppCategoryCatalogEntry,
  type HabitCategoryTag,
} from "@/entities/habit";
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
import {
  CATEGORY_PICKER_ICONS,
  DEFAULT_CUSTOM_ICON_NAME,
  type CategoryPickerIconName,
} from "@/shared/lib/lucidePickerIcons";
import {
  formatCategoryTagsSummary,
  isPresetSelected,
  togglePresetInTags,
} from "../lib/formatCategoryTagsSummary";
import { CustomCategoryLucideIcon } from "./CustomCategoryLucideIcon";
import { PresetCategoryIcon } from "./presetCategoryIcons";

type DrawerView = "main" | "custom" | "icons";

interface HabitCategoriesFieldProps {
  value: HabitCategoryTag[];
  onChange: (next: HabitCategoryTag[]) => void;
}

export const HabitCategoriesField = ({
  value,
  onChange,
}: HabitCategoriesFieldProps) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<DrawerView>("main");
  const [draft, setDraft] = useState<HabitCategoryTag[]>(value);
  const [customLabel, setCustomLabel] = useState("");
  const [customIconName, setCustomIconName] = useState<CategoryPickerIconName>(
    DEFAULT_CUSTOM_ICON_NAME,
  );
  const [iconSearch, setIconSearch] = useState("");

  const catalogItems = useHabitCategoryCatalogStore((s) => s.items);
  const bootstrapCatalog = useHabitCategoryCatalogStore(
    (s) => s.bootstrapCatalog,
  );
  const addUserCategory = useHabitCategoryCatalogStore(
    (s) => s.addUserCategory,
  );
  const ensureFromHabitTags = useHabitCategoryCatalogStore(
    (s) => s.ensureFromHabitTags,
  );

  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (open) {
      bootstrapCatalog();
      setDraft(value);
      setView("main");
      setCustomLabel("");
      setCustomIconName(DEFAULT_CUSTOM_ICON_NAME);
      setIconSearch("");
      ensureFromHabitTags(value);
    }
  }, [open, value, bootstrapCatalog, ensureFromHabitTags]);

  const summary = useMemo(() => formatCategoryTagsSummary(value), [value]);

  const filteredIcons = useMemo(() => {
    const q = iconSearch.trim().toLowerCase();
    if (!q) return CATEGORY_PICKER_ICONS;
    return CATEGORY_PICKER_ICONS.filter((e) =>
      e.name.toLowerCase().includes(q),
    );
  }, [iconSearch]);

  const catalogIds = useMemo(
    () => new Set(catalogItems.map((e) => e.id)),
    [catalogItems],
  );

  /** Свои теги в черновике, которых ещё нет в библиотеке (старые данные до библиотеки). */
  const orphanCustomDraftTags = useMemo(
    () =>
      draft.filter(
        (t): t is Extract<HabitCategoryTag, { type: "custom" }> =>
          t.type === "custom" && !catalogIds.has(t.id),
      ),
    [draft, catalogIds],
  );

  const handleOpenCustom = () => {
    setCustomLabel("");
    setCustomIconName(DEFAULT_CUSTOM_ICON_NAME);
    setView("custom");
  };

  const handleAddCustom = () => {
    const label = customLabel.trim();
    if (!label) return;
    const id = crypto.randomUUID();
    addUserCategory({
      id,
      label,
      iconName: customIconName,
    });
    setDraft((prev) => [
      ...prev,
      { type: "custom", id, label, iconName: customIconName },
    ]);
    setView("main");
  };

  const toggleCatalogEntryInDraft = (entry: AppCategoryCatalogEntry) => {
    if (entry.kind === "default" && isPresetCategoryId(entry.id)) {
      setDraft((prev) => togglePresetInTags(prev, entry.id));
      return;
    }
    if (entry.kind === "user" && entry.iconName) {
      setDraft((prev) => {
        const has = prev.some((t) => t.type === "custom" && t.id === entry.id);
        if (has) {
          return prev.filter(
            (t) => !(t.type === "custom" && t.id === entry.id),
          );
        }
        return [
          ...prev,
          {
            type: "custom" as const,
            id: entry.id,
            label: entry.label,
            iconName: entry.iconName,
          },
        ];
      });
    }
  };

  const handleDrawerOpenChange = (next: boolean) => {
    if (!next) {
      onChange(draftRef.current);
    }
    setOpen(next);
  };

  const handleSaveMain = () => {
    handleDrawerOpenChange(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => handleDrawerOpenChange(true)}
        className={cn(
          "rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors w-full",
          "hover:bg-muted/40 active:bg-muted/60",
        )}
      >
        <div className="text-[11px] text-muted-foreground">Категории</div>
        <div className="mt-0.5 flex items-center justify-between text-[13px] text-foreground">
          <span className="line-clamp-1 pr-2">{summary}</span>
          <ChevronIcon />
        </div>
      </button>

      <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          {view === "main" ? (
            <>
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-lg">Категории</DrawerTitle>
                <DrawerDescription className="text-left">
                  Выберите одну или несколько категорий, которые соответствуют
                  вашей привычке
                </DrawerDescription>
              </DrawerHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {catalogItems.map((entry) => {
                    if (
                      entry.kind === "default" &&
                      isPresetCategoryId(entry.id)
                    ) {
                      const selected = isPresetSelected(draft, entry.id);
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => toggleCatalogEntryInDraft(entry)}
                          className={cn(
                            "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                            selected
                              ? "border-primary bg-primary/15 text-foreground"
                              : "border-border bg-card text-foreground",
                          )}
                          aria-pressed={selected}
                        >
                          <PresetCategoryIcon id={entry.id} size={16} />
                          <span className="min-w-0 truncate">
                            {entry.label}
                          </span>
                        </button>
                      );
                    }
                    if (entry.kind === "user" && entry.iconName) {
                      const selected = draft.some(
                        (t) => t.type === "custom" && t.id === entry.id,
                      );
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => toggleCatalogEntryInDraft(entry)}
                          className={cn(
                            "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                            selected
                              ? "border-primary bg-primary/15 text-foreground"
                              : "border-border bg-card text-foreground",
                          )}
                          aria-pressed={selected}
                        >
                          <CustomCategoryLucideIcon
                            name={entry.iconName}
                            size={16}
                            className="shrink-0 text-foreground"
                          />
                          <span className="min-w-0 truncate">
                            {entry.label}
                          </span>
                        </button>
                      );
                    }
                    return null;
                  })}
                  {orphanCustomDraftTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setDraft((prev) =>
                          prev.filter(
                            (t) => !(t.type === "custom" && t.id === tag.id),
                          ),
                        )
                      }
                      className={cn(
                        "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                        "border-primary bg-primary/15 text-foreground",
                      )}
                      aria-pressed
                    >
                      <CustomCategoryLucideIcon
                        name={tag.iconName}
                        size={16}
                        className="shrink-0 text-foreground"
                      />
                      <span className="min-w-0 truncate">{tag.label}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleOpenCustom}
                    className="inline-flex items-center gap-2 rounded-full border border-dashed border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    <span className="text-primary">+</span>
                    Создать свою
                  </button>
                </div>
              </div>
              <DrawerFooter className="pt-2">
                <Button
                  type="button"
                  className="h-12 w-full text-base font-semibold"
                  onClick={handleSaveMain}
                >
                  Сохранить
                </Button>
              </DrawerFooter>
            </>
          ) : null}

          {view === "custom" ? (
            <>
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-lg">Своя категория</DrawerTitle>
                <DrawerDescription className="text-left">
                  Название и значок отображаются в списке категорий привычки
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4 px-4 pb-2">
                <div>
                  <label
                    htmlFor="custom-cat-name"
                    className="text-sm text-muted-foreground"
                  >
                    Название
                  </label>
                  <Input
                    id="custom-cat-name"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Например, Сад"
                    className="mt-1.5 h-11 rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIconSearch("");
                    setView("icons");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <CustomCategoryLucideIcon
                      name={customIconName}
                      size={22}
                      className="text-foreground"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">
                      Выбрать значок
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Иконка для категории
                    </div>
                  </div>
                  <ChevronIcon />
                </button>
              </div>
              <DrawerFooter className="flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => setView("main")}
                >
                  Назад
                </Button>
                <Button
                  type="button"
                  className="h-11 flex-1 font-semibold"
                  disabled={!customLabel.trim()}
                  onClick={handleAddCustom}
                >
                  Добавить
                </Button>
              </DrawerFooter>
            </>
          ) : null}

          {view === "icons" ? (
            <>
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-lg">Выбрать значок</DrawerTitle>
                <DrawerDescription className="text-left">
                  Выберите значок для категории
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-2">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Поиск на английском"
                    className="h-11 rounded-xl pl-10"
                  />
                </div>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  Деятельность
                </p>
                <div className="mt-2 grid max-h-[42vh] grid-cols-6 gap-2 overflow-y-auto pb-2 sm:grid-cols-7">
                  {filteredIcons.map(({ name, Icon }) => {
                    const selected = customIconName === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setCustomIconName(name as CategoryPickerIconName);
                          setView("custom");
                        }}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-xl border transition-colors",
                          selected
                            ? "border-primary bg-primary/15"
                            : "border-border bg-card hover:bg-muted/50",
                        )}
                        aria-label={name}
                      >
                        <Icon
                          size={20}
                          strokeWidth={2}
                          fill="none"
                          stroke="currentColor"
                          className="text-foreground"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <DrawerFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => setView("custom")}
                >
                  Назад
                </Button>
              </DrawerFooter>
            </>
          ) : null}
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
