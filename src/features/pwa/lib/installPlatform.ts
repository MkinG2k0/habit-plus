/** iPhone / iPad Safari (или Chrome UIWebView на iOS — тот же A2HS-путь). */
export const isIosSafari = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIos) return false;
  // Исключаем in-app браузеры без Share → Home Screen
  const isCriOS = /CriOS/.test(ua);
  const isFxiOS = /FxiOS/.test(ua);
  const isSafari = /Safari/.test(ua) && !isCriOS && !isFxiOS;
  return isSafari || isCriOS;
};

/** Chrome / Edge / Chromium — нативный beforeinstallprompt. */
export const isChromiumBrowser = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua) || /Chrome\//.test(ua) || /CriOS/.test(ua)) {
    return !/iPad|iPhone|iPod/.test(ua);
  }
  return false;
};
