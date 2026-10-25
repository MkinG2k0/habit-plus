import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
import { formatLocalDateKey } from "../lib/computeHabitStreak";
import { completionDayFilled } from "../model/habitCompletion";
import type { Habit, ViewMode } from "../model/types";

interface HabitState {
  habits: Habit[];
  viewMode: ViewMode;
  toggleToday: (id: number) => void;
  toggleDateCompletion: (id: number, dateKey: string) => void;
  setHabitDayCompletionValue: (
    id: number,
    dateKey: string,
    value: number,
  ) => void;
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
            if (h.trackingMode === "custom") return h;
            const today = formatLocalDateKey(new Date());
            const filled = completionDayFilled(h.completions[today]);
            return {
              ...h,
              completions: {
                ...h.completions,
                [today]: !filled,
              },
            };
          }),
        })),

      toggleDateCompletion: (id, dateKey) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            if (h.trackingMode === "custom") return h;
            const filled = completionDayFilled(h.completions[dateKey]);
            return {
              ...h,
              completions: { ...h.completions, [dateKey]: !filled },
            };
          }),
        })),

      setHabitDayCompletionValue: (id, dateKey, value) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const next = { ...h.completions };
            if (value <= 0) {
              delete next[dateKey];
            } else {
              next[dateKey] = value;
            }
            return { ...h, completions: next };
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
