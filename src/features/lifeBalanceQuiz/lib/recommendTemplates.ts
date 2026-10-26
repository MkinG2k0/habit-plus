import {
  getHabitTemplatesByCategory,
  type Habit,
  type HabitTemplate,
  type HabitTemplateCategoryId,
} from "@/entities/habit";
import { normalizeHabitName } from "./normalizeHabitName";
import { getWeakestSpheres, type SphereScore } from "./scoreQuiz";

const TEMPLATES_PER_WEAK_SPHERE = 2;

export function recommendTemplates(
  scores: readonly SphereScore[],
  existingHabits: readonly Habit[],
  weakCount = 3,
): HabitTemplate[] {
  const existingNames = new Set(
    existingHabits.map((h) => normalizeHabitName(h.name)),
  );
  const weakSpheres = getWeakestSpheres(scores, weakCount);
  const result: HabitTemplate[] = [];
  const usedIds = new Set<string>();

  for (const sphereId of weakSpheres) {
    const picked = pickForSphere(sphereId, existingNames, usedIds);
    result.push(...picked);
  }

  return result;
}

/**
 * Меняет шаблон на следующий доступный в той же сфере
 * (не из привычек и не из текущего списка рекомендаций).
 * Возвращает null, если замен нет.
 */
export function replaceRecommendedTemplate(
  current: HabitTemplate,
  recommendations: readonly HabitTemplate[],
  existingHabits: readonly Habit[],
): HabitTemplate | null {
  const existingNames = new Set(
    existingHabits.map((h) => normalizeHabitName(h.name)),
  );
  const usedIds = new Set(
    recommendations
      .filter((t) => t.id !== current.id)
      .map((t) => t.id),
  );

  const pool = getHabitTemplatesByCategory(current.categoryId);
  const currentIndex = pool.findIndex((t) => t.id === current.id);
  const start = currentIndex >= 0 ? currentIndex + 1 : 0;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = pool[(start + offset) % pool.length];
    if (!candidate || candidate.id === current.id) continue;
    if (usedIds.has(candidate.id)) continue;
    if (existingNames.has(normalizeHabitName(candidate.name))) continue;
    return candidate;
  }

  return null;
}

function pickForSphere(
  sphereId: HabitTemplateCategoryId,
  existingNames: ReadonlySet<string>,
  usedIds: Set<string>,
): HabitTemplate[] {
  const templates = getHabitTemplatesByCategory(sphereId);
  const picked: HabitTemplate[] = [];

  for (const template of templates) {
    if (picked.length >= TEMPLATES_PER_WEAK_SPHERE) break;
    if (usedIds.has(template.id)) continue;
    if (existingNames.has(normalizeHabitName(template.name))) continue;
    usedIds.add(template.id);
    picked.push(template);
  }

  return picked;
}
