import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { isWebPwaRuntime } from "../lib/isWebPwaRuntime";

export const PwaUpdateToast = () => {
  if (!isWebPwaRuntime()) {
    return null;
  }

  return <PwaUpdateToastInner />;
};

const PwaUpdateToastInner = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex w-full max-w-md flex-col gap-3 rounded-lg border border-border bg-card p-3.5 text-card-foreground shadow-lg">
        <p className="text-sm text-foreground">
          {needRefresh
            ? "Доступна новая версия приложения."
            : "Приложение готово к работе без интернета."}
        </p>
        <div className="flex justify-end gap-2">
          {needRefresh ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                void updateServiceWorker(true);
              }}
            >
              Обновить
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={close}>
            {needRefresh ? "Позже" : "Ок"}
          </Button>
        </div>
      </div>
    </div>
  );
};
