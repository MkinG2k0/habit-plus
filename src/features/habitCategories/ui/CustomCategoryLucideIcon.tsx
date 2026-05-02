import { Sparkles } from "lucide-react";
import { getCategoryPickerIconEntry } from "../lib/categoryPickerIcons";

export const CustomCategoryLucideIcon = ({
  name,
  className,
  size = 20,
}: {
  name: string;
  className?: string;
  size?: number;
}) => {
  const entry = getCategoryPickerIconEntry(name);
  const Icon = entry?.Icon ?? Sparkles;
  return <Icon className={className} size={size} strokeWidth={2} />;
};
