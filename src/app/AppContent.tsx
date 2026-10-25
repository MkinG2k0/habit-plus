import { Suspense } from "react";
import { useHabitReminderScheduler } from "@/features/habitReminders";
import { OfflineBanner, PwaUpdateToast } from "@/features/pwa";
import { AppRoutes } from "./router/routes.tsx";
import { AppLayout } from "./layout/AppLayout.tsx";

export const AppContent = () => {
  useHabitReminderScheduler();

  return (
    <AppLayout>
      <OfflineBanner />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Загрузка…
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
      <PwaUpdateToast />
    </AppLayout>
  );
};
