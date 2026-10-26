import { beforeEach, describe, expect, it } from "vitest";
import { useQuizOnboardingStore } from "./quizOnboardingStore";

describe("useQuizOnboardingStore", () => {
  beforeEach(() => {
    useQuizOnboardingStore.setState({ hasCompletedOrSkippedQuiz: false });
  });

  it("marks quiz done", () => {
    expect(useQuizOnboardingStore.getState().hasCompletedOrSkippedQuiz).toBe(
      false,
    );
    useQuizOnboardingStore.getState().markQuizDone();
    expect(useQuizOnboardingStore.getState().hasCompletedOrSkippedQuiz).toBe(
      true,
    );
  });
});
