import { useEffect } from "react";
import { isIosSafari } from "./installPlatform";
import { isWebPwaRuntime } from "./isWebPwaRuntime";
import {
  selectCanOfferInstall,
  selectCanPrompt,
  selectShouldShowInstallBanner,
  usePwaInstallStore,
} from "./pwaInstallStore";

export const usePwaInstall = () => {
  const canUse = isWebPwaRuntime();
  const ensureListeners = usePwaInstallStore((s) => s.ensureListeners);
  const hydrateDismiss = usePwaInstallStore((s) => s.hydrateDismiss);
  const isInstalled = usePwaInstallStore((s) => s.isInstalled);
  const canPrompt = usePwaInstallStore(selectCanPrompt);
  const canOfferInstall = usePwaInstallStore(selectCanOfferInstall);
  const shouldShowInstallBanner = usePwaInstallStore(
    selectShouldShowInstallBanner,
  );
  const promptInstall = usePwaInstallStore((s) => s.promptInstall);
  const dismissPrompt = usePwaInstallStore((s) => s.dismissPrompt);

  useEffect(() => {
    ensureListeners();
    hydrateDismiss();
  }, [ensureListeners, hydrateDismiss]);

  return {
    canUse,
    isInstalled,
    canPrompt,
    canOfferInstall,
    shouldShowInstallBanner,
    isIosSafari: isIosSafari(),
    promptInstall,
    dismissPrompt,
  };
};
