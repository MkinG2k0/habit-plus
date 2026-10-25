import { useState } from "react";
import { Card } from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";
import { useOnlineStatus } from "../lib/useOnlineStatus";
import { usePwaInstall } from "../lib/usePwaInstall";
import { isWebPwaRuntime } from "../lib/isWebPwaRuntime";

interface PwaSettingsCardProps {
  iconClass: string;
}

export const PwaSettingsCard = ({ iconClass }: PwaSettingsCardProps) => {
  const {
    canUse,
    isInstalled,
    canPrompt,
    canOfferInstall,
    isIosSafari,
    promptInstall,
  } = usePwaInstall();
  const isOnline = useOnlineStatus();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  if (!canUse || !isWebPwaRuntime()) {
    return null;
  }

  const statusLabel = isInstalled
    ? "Установлено как приложение"
    : canPrompt
      ? "Можно установить на домашний экран"
      : isIosSafari
        ? "Добавьте на домашний экран через Safari"
        : "Откройте в браузере Chrome / Safari для установки";

  const offlineLabel = isOnline
    ? "Онлайн — shell кэшируется для офлайна"
    : "Офлайн — привычки доступны локально";

  const onInstallClick = () => {
    if (isIosSafari || !canPrompt) {
      setShowIosGuide((open) => !open);
      return;
    }
    setIsPrompting(true);
    void promptInstall().finally(() => {
      setIsPrompting(false);
    });
  };

  return (
    <div className="mb-5">
      <div className="mb-2 pl-1 text-[13px] font-medium text-muted-foreground">
        Установка и офлайн
      </div>
      <Card className="overflow-hidden border shadow-none">
        <ul className="divide-y divide-border">
          <li>
            <div className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-base",
                  iconClass,
                )}
              >
                📱
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] text-foreground">Приложение</div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {statusLabel}
                </p>
              </div>
              {canOfferInstall ? (
                <button
                  type="button"
                  disabled={isPrompting}
                  className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
                  onClick={onInstallClick}
                >
                  Установить
                </button>
              ) : null}
            </div>
          </li>
          <li>
            <div className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-base",
                  iconClass,
                )}
              >
                {isOnline ? "🌐" : "📴"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] text-foreground">Сеть</div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {offlineLabel}
                </p>
              </div>
            </div>
          </li>
          {showIosGuide || (!isInstalled && !canPrompt) ? (
            <li>
              <p className="px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                {isIosSafari
                  ? "iPhone: «Поделиться» → «На экран „Домой“»."
                  : "Android Chrome: меню → «Установить приложение» или «Добавить на главный экран». iPhone: «Поделиться» → «На экран „Домой“»."}
              </p>
            </li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
};
