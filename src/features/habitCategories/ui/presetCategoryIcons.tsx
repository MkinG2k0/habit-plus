import type { HabitPresetCategoryId } from "@/entities/habit";
import type { LucideIcon } from "lucide-react";
import {
  Bike,
  BookHeart,
  Briefcase,
  CloudSun,
  Diamond,
  GraduationCap,
  Heart,
  Home,
  Moon,
  Palette,
  Palmtree,
  Rocket,
  Sparkles,
  Sun,
  Users,
  UsersRound,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

const PRESET_ICONS: Record<HabitPresetCategoryId, LucideIcon> = {
  family: Home,
  health: Heart,
  selfDevelopment: Sparkles,
  career: Rocket,
  spirituality: BookHeart,
  socialCircle: UsersRound,
  leisure: Palmtree,
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
