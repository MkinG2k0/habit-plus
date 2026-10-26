import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { toPng } from "html-to-image";

function buildResultFileName(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `habit-plus-koleso-${y}-${m}-${d}.png`;
}

function resolveExportBackground(element: HTMLElement): string {
  const fromEl = getComputedStyle(element).backgroundColor;
  if (fromEl && fromEl !== "rgba(0, 0, 0, 0)" && fromEl !== "transparent") {
    return fromEl;
  }
  const fromRoot = getComputedStyle(document.documentElement).backgroundColor;
  if (fromRoot && fromRoot !== "rgba(0, 0, 0, 0)" && fromRoot !== "transparent") {
    return fromRoot;
  }
  return "#0a0a0a";
}

function downloadDataUrlInBrowser(dataUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Скачивает PNG результата колеса (браузер) или открывает Share (native).
 */
export async function downloadOrShareQuizResult(
  element: HTMLElement,
): Promise<void> {
  const fileName = buildResultFileName();
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: resolveExportBackground(element),
  });

  if (!Capacitor.isNativePlatform()) {
    downloadDataUrlInBrowser(dataUrl, fileName);
    return;
  }

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  const written = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
  });

  await Share.share({
    title: "Колесо баланса — Habiday",
    text: "Мой результат квиза баланса сфер",
    url: written.uri,
    dialogTitle: "Сохранить результат",
  });
}
