import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
import type { Habit, ViewMode } from "../model/types";

interface HabitState {
  habits: Habit[];
  viewMode: ViewMode;
  toggleToday: (id: number) => void;
  toggleDateCompletion: (id: number, dateKey: string) => void;
  addHabit: (data: Omit<Habit, "id" | "completions">) => void;
  updateHabit: (id: number, data: Partial<Omit<Habit, "id">>) => void;
  deleteHabit: (id: number) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      viewMode: "grid",

      toggleToday: (id) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const today = new Date().toISOString().slice(0, 10);
            const done = !h.completions[today];
            return { ...h, completions: { ...h.completions, [today]: done } };
          }),
        })),

      toggleDateCompletion: (id, dateKey) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const done = !(h.completions[dateKey] ?? false);
            return {
              ...h,
              completions: { ...h.completions, [dateKey]: done },
            };
          }),
        })),

      addHabit: (data) =>
        set((state) => ({
          habits: [
            ...state.habits,
            { ...data, id: Date.now(), completions: {} },
          ],
        })),

      updateHabit: (id, data) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...data } : h,
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: "habit-plus-v1",
      storage: createJSONStorage(() => zustandAppStorage),
    },
  ),
);
