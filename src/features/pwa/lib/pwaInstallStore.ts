import { create } from "zustand";
import { appStorage } from "@/shared/lib/storageAdapter";
import { isIosSafari } from "./installPlatform";
import { isWebPwaRuntime } from "./isWebPwaRuntime";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "pwa-install-prompt-dismissed";

const isStandaloneDisplay = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
};

interface PwaInstallState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isDismissed: boolean;
  dismissHydrated: boolean;
  listenersReady: boolean;
  ensureListeners: () => void;
  hydrateDismiss: () => void;
  dismissPrompt: () => void;
  promptInstall: () => Promise<boolean>;
}

let listenersAttached = false;

export const usePwaInstallStore = create<PwaInstallState>((set, get) => ({
  deferredPrompt: null,
  isInstalled: isStandaloneDisplay(),
  isDismissed: false,
  dismissHydrated: false,
  listenersReady: false,

  hydrateDismiss: () => {
    if (!isWebPwaRuntime()) {
      set({ dismissHydrated: true });
      return;
    }
    void appStorage.getString(DISMISS_KEY).then((value) => {
      set({ isDismissed: value === "1", dismissHydrated: true });
    });
  },

  ensureListeners: () => {
    if (listenersAttached || typeof window === "undefined") return;
    if (!isWebPwaRuntime()) {
      set({ listenersReady: true, isInstalled: true });
      return;
    }
    listenersAttached = true;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      set({ deferredPrompt: event as BeforeInstallPromptEvent });
    };

    const onInstalled = () => {
      set({
        deferredPrompt: null,
        isInstalled: true,
        isDismissed: false,
      });
      void appStorage.remove(DISMISS_KEY);
    };

    const onDisplayModeChange = (event: MediaQueryListEvent) => {
      if (event.matches) set({ isInstalled: true });
    };

    const media = window.matchMedia("(display-mode: standalone)");
    media.addEventListener("change", onDisplayModeChange);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    set({
      isInstalled: isStandaloneDisplay(),
      listenersReady: true,
    });
  },

  dismissPrompt: () => {
    set({ isDismissed: true });
    void appStorage.setString(DISMISS_KEY, "1");
  },

  promptInstall: async () => {
    const { deferredPrompt, dismissPrompt } = get();
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    set({ deferredPrompt: null });
    if (choice.outcome === "accepted") {
      set({ isInstalled: true, isDismissed: false });
      void appStorage.remove(DISMISS_KEY);
      return true;
    }
    dismissPrompt();
    return false;
  },
}));

export const selectCanPrompt = (s: PwaInstallState) =>
  Boolean(s.deferredPrompt);

/** Кнопка в настройках: пока не установлено — нативный prompt, iOS-гайд или после отказа. */
export const selectCanOfferInstall = (s: PwaInstallState) =>
  !s.isInstalled &&
  (Boolean(s.deferredPrompt) || isIosSafari() || s.isDismissed);

export const selectShouldShowInstallBanner = (s: PwaInstallState) => {
  if (!isWebPwaRuntime()) return false;
  if (!s.dismissHydrated || s.isInstalled || s.isDismissed) return false;
  const ios = isIosSafari();
  const canPrompt = Boolean(s.deferredPrompt);
  // Chrome: ждём beforeinstallprompt. Safari: сразу A2HS-баннер.
  if (ios) return true;
  if (canPrompt) return true;
  return false;
};
