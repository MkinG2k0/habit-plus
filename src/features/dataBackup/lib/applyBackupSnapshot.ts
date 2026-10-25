import { appStorage } from "@/shared/lib/storageAdapter";
import {
  BACKUP_EXCLUDED_KEYS,
  type HabitPlusBackup,
} from "./backupTypes";

/**
 * Полностью заменяет пользовательские данные из бэкапа.
 * Ключи из exclude-списка не трогаем. После вызова нужен reload / rehydrate.
 */
export const applyBackupSnapshot = async (
  backup: HabitPlusBackup,
): Promise<void> => {
  const existing = await appStorage.keys();
  for (const key of existing) {
    if (BACKUP_EXCLUDED_KEYS.has(key)) continue;
    await appStorage.remove(key);
  }

  for (const [key, value] of Object.entries(backup.keys)) {
    if (BACKUP_EXCLUDED_KEYS.has(key)) continue;
    await appStorage.setString(key, value);
  }
};
