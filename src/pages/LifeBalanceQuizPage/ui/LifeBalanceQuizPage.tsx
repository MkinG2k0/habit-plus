import { LifeBalanceQuizFlow, useQuizOnboardingStore } from "@/features/lifeBalanceQuiz";

export const LifeBalanceQuizPage = () => {
  const hasCompletedOrSkippedQuiz = useQuizOnboardingStore(
    (s) => s.hasCompletedOrSkippedQuiz,
  );

  return (
    <LifeBalanceQuizFlow allowSkip={!hasCompletedOrSkippedQuiz} />
  );
};
