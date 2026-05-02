import { Suspense } from "react";
import { AppRoutes } from "./router/routes.tsx";
import { AppLayout } from "./layout/AppLayout.tsx";

export const AppContent = () => {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Загрузка…
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </AppLayout>
  );
};
