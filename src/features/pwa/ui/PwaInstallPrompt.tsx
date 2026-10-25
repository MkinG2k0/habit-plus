import { useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { usePwaInstall } from "../lib/usePwaInstall";
import { isWebPwaRuntime } from "../lib/isWebPwaRuntime";

export const PwaInstallPrompt = () => {
  if (!isWebPwaRuntime()) {
    return null;
  }

  return <PwaInstallPromptInner />;
};

const PwaInstallPromptInner = () => {
  const {
    shouldShowInstallBanner,
    isIosSafari,
    promptInstall,
    dismissPrompt,
  } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  if (!shouldShowInstallBanner && !showIosGuide) {
    return null;
  }

  const onInstall = () => {
    if (isIosSafari) {
      setShowIosGuide(true);
      return;
    }
    setIsPrompting(true);
    void promptInstall().finally(() => {
      setIsPrompting(false);
    });
  };

  const onDismiss = () => {
    setShowIosGuide(false);
    dismissPrompt();
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <div className="pointer-events-auto flex w-full max-w-md flex-col gap-3 rounded-lg border border-border bg-card p-3.5 text-card-foreground shadow-lg">
        {showIosGuide ? (
          <>
            <div>
              <p
                id="pwa-install-title"
                className="text-sm font-medium text-foreground"
              >
                Установка на iPhone
              </p>
              <p
                id="pwa-install-desc"
                className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
              >
                Нажмите «Поделиться» внизу Safari, затем «На экран „Домой“».
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="outline" onClick={onDismiss}>
                Понятно
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p
                id="pwa-install-title"
                className="text-sm font-medium text-foreground"
              >
                Установить habit+
              </p>
              <p
                id="pwa-install-desc"
                className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
              >
                {isIosSafari
                  ? "Добавьте на домашний экран — быстрее запуск и работа без вкладки."
                  : "Установите приложение на устройство — быстрый доступ и офлайн."}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onDismiss}
              >
                Не сейчас
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isPrompting}
                onClick={onInstall}
              >
                {isIosSafari ? "Как установить" : "Установить"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
