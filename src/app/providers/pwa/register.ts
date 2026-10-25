/**
 * SW registration is handled by `PwaUpdateToast` via
 * `virtual:pwa-register/react` (prompt updates + offline-ready).
 * Kept as a no-op export for any legacy call sites.
 */
export const registerServiceWorker = (): void => {
  // no-op
};
