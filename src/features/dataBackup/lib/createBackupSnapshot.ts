import { appStorage } from "@/shared/lib/storageAdapter";
import {
  BACKUP_EXCLUDED_KEYS,
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type HabitPlusBackup,
} from "./backupTypes";

export const createBackupSnapshot = async (): Promise<HabitPlusBackup> => {
  const allKeys = await appStorage.keys();
  const keys: Record<string, string> = {};

  for (const key of allKeys) {
    if (BACKUP_EXCLUDED_KEYS.has(key)) continue;
    const value = await appStorage.getString(key);
    if (value == null) continue;
    keys[key] = value;
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    keys,
  };
};

export const serializeBackup = (backup: HabitPlusBackup): string =>
  JSON.stringify(backup, null, 2);

export const buildBackupFileName = (exportedAt = new Date()): string => {
  const y = exportedAt.getFullYear();
  const m = String(exportedAt.getMonth() + 1).padStart(2, "0");
  const d = String(exportedAt.getDate()).padStart(2, "0");
  return `habit-plus-backup-${y}-${m}-${d}.json`;
};
