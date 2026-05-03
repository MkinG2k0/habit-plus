/** Краткая подпись цели серии для строки настроек (дни). */
export function formatStreakGoalSummary(
  days: number | undefined,
): "Нет" | string {
  if (days == null || days <= 0) return "Нет";
  const n100 = days % 100;
  const n10 = days % 10;
  if (n100 >= 11 && n100 <= 14) return `${days} дней`;
  if (n10 === 1) return `${days} день`;
  if (n10 >= 2 && n10 <= 4) return `${days} дня`;
  return `${days} дней`;
}
