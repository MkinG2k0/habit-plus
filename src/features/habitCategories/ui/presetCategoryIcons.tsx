import type { HabitPresetCategoryId } from "@/entities/habit";
import type { LucideIcon } from "lucide-react";
import {
  Bike,
  Briefcase,
  CloudSun,
  Diamond,
  GraduationCap,
  Heart,
  Moon,
  Palette,
  Sun,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

const PRESET_ICONS: Record<HabitPresetCategoryId, LucideIcon> = {
  health: Heart,
  art: Palette,
  communication: Users,
  nutrition: UtensilsCrossed,
  work: Briefcase,
  study: GraduationCap,
  finance: Wallet,
  fitness: Bike,
  other: Diamond,
  morning: CloudSun,
  day: Sun,
  evening: Moon,
};

export const PresetCategoryIcon = ({
  id,
  className,
  size = 16,
}: {
  id: HabitPresetCategoryId;
  className?: string;
  size?: number;
}) => {
  const Icon = PRESET_ICONS[id];
  return (
    <Icon
      className={className}
      size={size}
      strokeWidth={2}
      fill="none"
      stroke="currentColor"
    />
  );
};
