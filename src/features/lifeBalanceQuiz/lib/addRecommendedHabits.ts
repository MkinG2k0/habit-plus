import {
  HABIT_PRESET_CATEGORY_COLORS,
  useHabitStore,
  type HabitTemplate,
  type HabitTemplateCategoryId,
} from "@/entities/habit";
import { SPHERE_HABIT_ICONS } from "./sphereHabitIcon";

export function addRecommendedHabits(templates: readonly HabitTemplate[]): void {
  const { addHabit } = useHabitStore.getState();

  for (const template of templates) {
    const sphereId = template.categoryId as HabitTemplateCategoryId;
    addHabit({
      name: template.name,
      desc: template.desc,
      color: HABIT_PRESET_CATEGORY_COLORS[sphereId],
      icon: SPHERE_HABIT_ICONS[sphereId],
      categoryTags: [{ type: "preset", id: sphereId }],
      streakInterval: "daily",
      trackingMode: "step",
    });
  }
}
