import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { toPng } from "html-to-image";

function buildHabitShareFileName(habitName: string, date = new Date()): string {
  const slug = habitName
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `habit-plus-${slug || "habit"}-${y}-${m}-${d}.png`;
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
 * Скачивает PNG карточки привычки (браузер) или открывает Share (native).
 */
export async function downloadOrShareHabitCard(
  element: HTMLElement,
  habitName: string,
  backgroundColor: string,
): Promise<void> {
  const fileName = buildHabitShareFileName(habitName);
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor,
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
    title: `${habitName} — Habiday`,
    text: `Моя привычка «${habitName}» в Habiday`,
    url: written.uri,
    dialogTitle: "Поделиться привычкой",
  });
}
