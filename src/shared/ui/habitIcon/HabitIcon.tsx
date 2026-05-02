import type { HabitIconId, HabitIconName } from "@/entities/habit";
import { getCategoryPickerIconEntry } from "@/shared/lib/lucidePickerIcons";
import { Sparkles } from "lucide-react";

interface HabitIconProps {
  name: HabitIconId;
  color?: string;
  size?: number;
}

const EMOJI_PREFIX = "emoji:";

export const HabitIcon = ({
  name,
  color = "#fff",
  size = 20,
}: HabitIconProps) => {
  if (name.startsWith(EMOJI_PREFIX)) {
    const glyph = name.slice(EMOJI_PREFIX.length);
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center leading-none"
        style={{
          fontSize: Math.round(size * 0.9),
          width: size,
          height: size,
        }}
        role="img"
        aria-hidden
      >
        {glyph}
      </span>
    );
  }

  const lucide = getCategoryPickerIconEntry(name);
  if (lucide) {
    const Icon = lucide.Icon;
    return (
      <Icon
        width={size}
        height={size}
        strokeWidth={2}
        fill="none"
        stroke={color}
        className="shrink-0"
      />
    );
  }

  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name as HabitIconName) {
    case "health":
      return (
        <svg {...props}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "brain":
      return (
        <svg {...props}>
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.98-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.1-2" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.1-2" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "sport":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      );
    case "water":
      return (
        <svg {...props}>
          <path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z" />
        </svg>
      );
    case "meditation":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
    case "music":
      return (
        <svg {...props}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "code":
      return (
        <svg {...props}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    default: {
      const Fallback = Sparkles;
      return (
        <Fallback
          width={size}
          height={size}
          strokeWidth={2}
          fill="none"
          stroke={color}
          className="shrink-0"
        />
      );
    }
  }
};
