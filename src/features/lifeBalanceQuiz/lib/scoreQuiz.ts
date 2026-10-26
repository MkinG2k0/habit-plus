import {
  HABIT_TEMPLATE_CATEGORY_IDS,
  type HabitTemplateCategoryId,
} from "@/entities/habit";
import type { LifeBalanceQuestion } from "../model/questions";

export interface SphereScore {
  sphereId: HabitTemplateCategoryId;
  /** Нормализованный балл 0–1 (доля от макс. баллов по вопросам сферы). */
  average: number;
  /** Доля внимания 0–100. */
  attentionPercent: number;
}

/** Ответ: индекс выбранного варианта в `question.options`. */
export type QuizAnswerIndex = number;

function optionMaxPoints(question: LifeBalanceQuestion): number {
  return Math.max(0, ...question.options.map((o) => o.points));
}

/**
 * Считает баллы по сферам из ответов (как на koleso.lariba.ru):
 * сумма набранных points / сумма максимальных points по вопросам сферы.
 */
export function scoreQuiz(
  questions: readonly LifeBalanceQuestion[],
  answers: ReadonlyMap<string, QuizAnswerIndex>,
): SphereScore[] {
  const buckets = new Map<
    HabitTemplateCategoryId,
    { earned: number; max: number }
  >();

  for (const id of HABIT_TEMPLATE_CATEGORY_IDS) {
    buckets.set(id, { earned: 0, max: 0 });
  }

  for (const q of questions) {
    const bucket = buckets.get(q.sphereId);
    if (!bucket) continue;
    const maxP = optionMaxPoints(q);
    bucket.max += maxP;

    const optIndex = answers.get(q.id);
    if (optIndex == null) continue;
    const option = q.options[optIndex];
    if (!option) continue;
    bucket.earned += option.points;
  }

  const scores: SphereScore[] = HABIT_TEMPLATE_CATEGORY_IDS.map((sphereId) => {
    const bucket = buckets.get(sphereId)!;
    const average = bucket.max > 0 ? bucket.earned / bucket.max : 0;
    return {
      sphereId,
      average,
      attentionPercent: Math.round(average * 100),
    };
  });

  const orderIndex = new Map(
    HABIT_TEMPLATE_CATEGORY_IDS.map((id, i) => [id, i]),
  );

  return scores.sort((a, b) => {
    if (a.average !== b.average) return a.average - b.average;
    return (orderIndex.get(a.sphereId) ?? 0) - (orderIndex.get(b.sphereId) ?? 0);
  });
}

export function getWeakestSpheres(
  scores: readonly SphereScore[],
  count = 3,
): HabitTemplateCategoryId[] {
  return scores.slice(0, count).map((s) => s.sphereId);
}
