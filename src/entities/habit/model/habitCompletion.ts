/** Значение за день: пошагово (да/нет) или число для режима «своё значение». */
export type HabitCompletionValue = boolean | number;

export function completionDayFilled(
  v: HabitCompletionValue | undefined,
): boolean {
  if (v === undefined || v === false) return false;
  if (v === true) return true;
  return typeof v === "number" && !Number.isNaN(v) && v > 0;
}

export function getCompletionNumericValue(
  v: HabitCompletionValue | undefined,
): number {
  if (v === true) return 1;
  if (typeof v === "number" && !Number.isNaN(v)) return Math.max(0, v);
  return 0;
}
