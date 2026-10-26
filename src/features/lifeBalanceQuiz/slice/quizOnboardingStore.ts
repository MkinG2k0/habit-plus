import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";

interface QuizOnboardingState {
  hasCompletedOrSkippedQuiz: boolean;
  markQuizDone: () => void;
}

export const useQuizOnboardingStore = create<QuizOnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOrSkippedQuiz: false,
      markQuizDone: () => set({ hasCompletedOrSkippedQuiz: true }),
    }),
    {
      name: "habit-plus-life-balance-quiz-v1",
      storage: createJSONStorage(() => zustandAppStorage),
    },
  ),
);
