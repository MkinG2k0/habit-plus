import type { Habit } from "@/entities/habit";
import {
  Drawer,
  DrawerContent,
} from "@/shared/ui/shadCNComponents/ui/drawer";
import { HabitDetailContent } from "./HabitDetailContent";

interface HabitDetailDrawerProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (habit: Habit) => void;
  onOpenReminders?: (habit: Habit) => void;
}

export const HabitDetailDrawer = ({
  habit,
  open,
  onOpenChange,
  onEdit,
  onOpenReminders,
}: HabitDetailDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="max-h-[90dvh] gap-0 border-0 bg-transparent p-0 shadow-none data-[vaul-drawer-direction=bottom]:mt-0">
        {habit ? (
          <HabitDetailContent
            habit={habit}
            onClose={() => onOpenChange(false)}
            onEdit={() => onEdit(habit)}
            onOpenReminders={
              onOpenReminders ? () => onOpenReminders(habit) : undefined
            }
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
};
