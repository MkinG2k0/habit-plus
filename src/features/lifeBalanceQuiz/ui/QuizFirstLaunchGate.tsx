import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuizOnboardingStore } from "../slice/quizOnboardingStore";

/**
 * После гидрации onboarding-store: если квиз ещё не проходили/не пропускали —
 * редирект на /quiz (кроме уже открытого /quiz).
 */
export const QuizFirstLaunchGate = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hasCompletedOrSkippedQuiz = useQuizOnboardingStore(
    (s) => s.hasCompletedOrSkippedQuiz,
  );
  const [hydrated, setHydrated] = useState(
    () => useQuizOnboardingStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsub = useQuizOnboardingStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useQuizOnboardingStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (hasCompletedOrSkippedQuiz) return;
    if (pathname === "/quiz") return;
    navigate("/quiz", { replace: true });
  }, [hydrated, hasCompletedOrSkippedQuiz, pathname, navigate]);

  return null;
};
