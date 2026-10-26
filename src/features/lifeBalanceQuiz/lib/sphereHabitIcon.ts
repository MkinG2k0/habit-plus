import type { HabitTemplateCategoryId } from "@/entities/habit";

/** Lucide-имя иконки по сфере (как в club import). */
export const SPHERE_HABIT_ICONS: Record<HabitTemplateCategoryId, string> = {
  family: "Heart",
  health: "Activity",
  selfDevelopment: "BookOpen",
  career: "Briefcase",
  spirituality: "Sparkles",
  socialCircle: "Users",
  leisure: "Coffee",
};
