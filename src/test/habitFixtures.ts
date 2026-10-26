import type { Habit } from "@/entities/habit";

export function makeHabit(
  overrides: Partial<Habit> & Pick<Habit, "id" | "name">,
): Habit {
  return {
    desc: "",
    icon: "book",
    color: "#22c55e",
    completions: {},
    streakInterval: "daily",
    trackingMode: "step",
    ...overrides,
  };
}
