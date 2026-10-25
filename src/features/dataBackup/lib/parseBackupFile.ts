import { isHabitPlusBackup, type HabitPlusBackup } from "./backupTypes";

export class BackupParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupParseError";
  }
}

export const parseBackupJson = (raw: string): HabitPlusBackup => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BackupParseError("Файл не является корректным JSON.");
  }

  if (!isHabitPlusBackup(parsed)) {
    throw new BackupParseError(
      "Это не бэкап habit+. Выберите файл, сохранённый через «Экспорт».",
    );
  }

  if (Object.keys(parsed.keys).length === 0) {
    throw new BackupParseError("В бэкапе нет данных.");
  }

  return parsed;
};

export const readBackupFromFile = (file: File): Promise<HabitPlusBackup> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text =
          typeof reader.result === "string" ? reader.result : "";
        resolve(parseBackupJson(text));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () =>
      reject(new BackupParseError("Не удалось прочитать файл."));
    reader.readAsText(file);
  });
