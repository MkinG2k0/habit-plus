import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appStorage } from "@/shared/lib/storageAdapter/appStorage";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
import type { HabitCategoryTag } from "../model/types";
import {
  buildDefaultHabitCategoryCatalog,
  normalizeCatalogItems,
  type AppCategoryCatalogEntry,
} from "../model/appCategoryCatalog";

const LEGACY_LIBRARY_KEY = "habit-plus-category-library-v1";

interface HabitCategoryCatalogState {
  items: AppCategoryCatalogEntry[];
  /** Нормализация дефолтов + порядок; при необходимости подтягивает legacy-библиотеку. */
  bootstrapCatalog: () => void;
  addUserCategory: (entry: {
    id: string;
    label: string;
    iconName: string;
  }) => void;
  /** Добавить пользовательские теги из привычки, которых ещё нет в каталоге. */
  ensureFromHabitTags: (tags: HabitCategoryTag[] | undefined) => void;
}

function parseLegacyLibraryPayload(raw: string): { id: string; label: string; iconName: string }[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];
    const state = (parsed as { state?: unknown }).state ?? parsed;
    const items = (state as { items?: unknown }).items;
    if (!Array.isArray(items)) return [];
    const out: { id: string; label: string; iconName: string }[] = [];
    for (const row of items) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      if (typeof r.id !== "string" || typeof r.label !== "string") continue;
      const iconName = typeof r.iconName === "string" ? r.iconName : "Sparkles";
      out.push({ id: r.id, label: r.label, iconName });
    }
    return out;
  } catch {
    return [];
  }
}

export const useHabitCategoryCatalogStore = create<HabitCategoryCatalogState>()(
  persist(
    (set, get) => ({
      items: buildDefaultHabitCategoryCatalog(),

      bootstrapCatalog: () => {
        set((state) => ({
          items: normalizeCatalogItems(state.items),
        }));

        void (async () => {
          const raw = await appStorage.getString(LEGACY_LIBRARY_KEY);
          if (!raw) return;
          const legacy = parseLegacyLibraryPayload(raw);
          if (!legacy.length) {
            await appStorage.remove(LEGACY_LIBRARY_KEY);
            return;
          }
          set((state) => {
            const have = new Set(state.items.map((e) => e.id));
            const toAdd: AppCategoryCatalogEntry[] = [];
            for (const e of legacy) {
              if (have.has(e.id)) continue;
              have.add(e.id);
              toAdd.push({
                id: e.id,
                label: e.label.trim() || "Своя",
                kind: "user",
                iconName: e.iconName,
              });
            }
            if (!toAdd.length) return state;
            return {
              items: normalizeCatalogItems([...state.items, ...toAdd]),
            };
          });
          await appStorage.remove(LEGACY_LIBRARY_KEY);
        })();
      },

      addUserCategory: (entry) =>
        set((state) => {
          if (state.items.some((e) => e.id === entry.id)) {
            return state;
          }
          return {
            items: normalizeCatalogItems([
              ...state.items,
              {
                id: entry.id,
                label: entry.label.trim() || "Своя",
                kind: "user",
                iconName: entry.iconName,
              },
            ]),
          };
        }),

      ensureFromHabitTags: (tags) => {
        if (!tags?.length) return;
        const existing = new Set(get().items.map((e) => e.id));
        const toAdd: AppCategoryCatalogEntry[] = [];
        for (const t of tags) {
          if (t.type !== "custom" || existing.has(t.id)) continue;
          existing.add(t.id);
          toAdd.push({
            id: t.id,
            label: t.label.trim() || "Своя",
            kind: "user",
            iconName: t.iconName,
          });
        }
        if (!toAdd.length) return;
        set((state) => ({
          items: normalizeCatalogItems([...state.items, ...toAdd]),
        }));
      },
    }),
    {
      name: "habit-plus-category-catalog-v1",
      storage: createJSONStorage(() => zustandAppStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
