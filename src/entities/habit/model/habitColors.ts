/** Палитра выбора цвета привычки (данные, не тема приложения). */
export const HABIT_COLOR_OPTIONS: string[] = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#facc15",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
];

export const DEFAULT_HABIT_COLOR = "#22c55e";

/** Текст на заливке `bgHex` (палитра привычек — #RGB / #RRGGBB). */
export function foregroundOnHabitColor(bgHex: string): "#0a0a0a" | "#fafafa" {
  const raw = bgHex.trim().replace("#", "");
  const hex =
    raw.length === 3
      ? `${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`
      : raw.length === 6
        ? raw
        : "";
  if (hex.length !== 6) return "#fafafa";
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return "#fafafa";
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y >= 150 ? "#0a0a0a" : "#fafafa";
}
