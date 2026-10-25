import { useOnlineStatus } from "../lib/useOnlineStatus";
import { isWebPwaRuntime } from "../lib/isWebPwaRuntime";

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (!isWebPwaRuntime() || isOnline) {
    return null;
  }

  return (
    <div
      className="shrink-0 border-b border-border bg-muted px-3 py-1.5 text-center text-xs text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      Нет сети — данные сохраняются на устройстве
    </div>
  );
};
