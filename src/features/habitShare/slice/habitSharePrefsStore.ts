import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
import {
  DEFAULT_HABIT_SHARE_RANGE,
  HABIT_SHARE_RANGE_OPTIONS,
  type HabitShareRangeId,
} from "../model/shareRange";

function isHabitShareRangeId(value: unknown): value is HabitShareRangeId {
  return HABIT_SHARE_RANGE_OPTIONS.some((option) => option.id === value);
}

interface HabitSharePrefsState {
  range: HabitShareRangeId;
}

interface HabitSharePrefsActions {
  setRange: (range: HabitShareRangeId) => void;
}

export const useHabitSharePrefsStore = create<
  HabitSharePrefsState & HabitSharePrefsActions
>()(
  persist(
    (set) => ({
      range: DEFAULT_HABIT_SHARE_RANGE,
      setRange: (range) => set({ range }),
    }),
    {
      name: "habit-share-prefs",
      storage: createJSONStorage(() => zustandAppStorage),
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === "object"
            ? (persisted as Partial<HabitSharePrefsState>)
            : {};
        return {
          ...current,
          ...raw,
          range: isHabitShareRangeId(raw.range)
            ? raw.range
            : DEFAULT_HABIT_SHARE_RANGE,
        };
      },
    },
  ),
);
