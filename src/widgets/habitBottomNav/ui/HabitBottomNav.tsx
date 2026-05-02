import type { ReactNode } from "react";
import type { ViewMode } from "@/entities/habit";
import { cn } from "@/shared/ui/lib/utils";

interface HabitBottomNavProps {
  view: ViewMode;
  onView: (v: ViewMode) => void;
}

export const HabitBottomNav = ({ view, onView }: HabitBottomNavProps) => {
  return (
    <div className="flex shrink-0 justify-center pt-2.5">
      <div
        className={cn(
          "flex items-center gap-4 rounded-full border border-border bg-card px-5 py-1.5",
        )}
      >
        <NavTab active={view === "grid"} onClick={() => onView("grid")}>
          <GridIcon active={view === "grid"} />
        </NavTab>
        <NavTab active={view === "list"} onClick={() => onView("list")}>
          <ListCheckIcon />
        </NavTab>
        <NavTab active={view === "cols"} onClick={() => onView("cols")}>
          <ColsIcon />
        </NavTab>
      </div>
    </div>
  );
};

function NavTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex size-11 items-center justify-center rounded-lg transition-colors",
        active ? "bg-accent text-chart-1" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn(!active && "opacity-90")}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListCheckIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function ColsIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="3" width="7" height="18" rx="1" />
    </svg>
  );
}
