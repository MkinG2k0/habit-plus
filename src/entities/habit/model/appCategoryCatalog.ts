import {
  HABIT_PRESET_CATEGORY_IDS,
  HABIT_PRESET_CATEGORY_LABELS,
  type HabitPresetCategoryId,
} from "./habitPresetCategories";

export type AppCategoryCatalogKind = "default" | "user";

/** Одна строка каталога: встроенная (дефолт из приложения) или пользовательская. */
export interface AppCategoryCatalogEntry {
  id: string;
  label: string;
  kind: AppCategoryCatalogKind;
  /** Только для `kind === "user"` — имя иконки Lucide. */
  iconName?: string;
}

export function isPresetCategoryId(id: string): id is HabitPresetCategoryId {
  return (HABIT_PRESET_CATEGORY_IDS as readonly string[]).includes(id);
}

/** Начальный набор категорий (дефолты до первого сохранения в storage). */
export function buildDefaultHabitCategoryCatalog(): AppCategoryCatalogEntry[] {
  return HABIT_PRESET_CATEGORY_IDS.map((id) => ({
    id,
    label: HABIT_PRESET_CATEGORY_LABELS[id],
    kind: "default" as const,
  }));
}

/**
 * Приводит сохранённый список к канону: все дефолтные id в фиксированном порядке,
 * затем пользовательские (без дубликатов с дефолтными id).
 */
export function normalizeCatalogItems(
  persisted: AppCategoryCatalogEntry[] | undefined,
): AppCategoryCatalogEntry[] {
  const list = persisted?.length ? persisted : buildDefaultHabitCategoryCatalog();

  const fromFile = new Map(list.map((e) => [e.id, e]));
  const builtins: AppCategoryCatalogEntry[] = HABIT_PRESET_CATEGORY_IDS.map((id) => {
    const row = fromFile.get(id);
    if (row?.kind === "default") {
      return {
        id,
        kind: "default" as const,
        label: row.label.trim()
          ? row.label
          : HABIT_PRESET_CATEGORY_LABELS[id],
      };
    }
    return {
      id,
      kind: "default" as const,
      label: HABIT_PRESET_CATEGORY_LABELS[id],
    };
  });

  const builtinIdSet = new Set<string>(HABIT_PRESET_CATEGORY_IDS as readonly string[]);
  const users: AppCategoryCatalogEntry[] = [];
  const seenUser = new Set<string>();

  for (const e of list) {
    if (e.kind !== "user" || !e.iconName) continue;
    if (builtinIdSet.has(e.id)) continue;
    if (seenUser.has(e.id)) continue;
    seenUser.add(e.id);
    users.push({
      id: e.id,
      kind: "user",
      label: e.label.trim() || "Своя",
      iconName: e.iconName,
    });
  }

  return [...builtins, ...users];
}
