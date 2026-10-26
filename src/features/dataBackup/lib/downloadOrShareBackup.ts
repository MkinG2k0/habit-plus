import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { buildBackupFileName } from "./createBackupSnapshot";

const downloadInBrowser = (json: string, fileName: string) => {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

/** Сохраняет JSON: Share sheet на нативе, скачивание в браузере. */
export const downloadOrShareBackup = async (
  json: string,
  fileName = buildBackupFileName(),
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    downloadInBrowser(json, fileName);
    return;
  }

  const written = await Filesystem.writeFile({
    path: fileName,
    data: json,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });

  await Share.share({
    title: "Бэкап Habiday",
    text: "Сохраните файл в Drive или Files — на случай сброса телефона.",
    url: written.uri,
    dialogTitle: "Сохранить бэкап",
  });
};
