import { Capacitor } from "@capacitor/core";

/** Web/PWA only — native Capacitor shells manage their own offline packaging. */
export const isWebPwaRuntime = (): boolean => !Capacitor.isNativePlatform();
