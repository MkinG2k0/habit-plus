export const BACKUP_FORMAT = "habit-plus-backup" as const;
export const BACKUP_VERSION = 1 as const;

/** Ключи, которые не попадают в бэкап (токены и т.п.). */
export const BACKUP_EXCLUDED_KEYS = new Set(["user-store"]);

export interface HabitPlusBackup {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  /** Сырые строковые значения из Preferences / localStorage. */
  keys: Record<string, string>;
}

export const isHabitPlusBackup = (value: unknown): value is HabitPlusBackup => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.format !== BACKUP_FORMAT) return false;
  if (typeof v.version !== "number") return false;
  if (typeof v.exportedAt !== "string") return false;
  if (!v.keys || typeof v.keys !== "object" || Array.isArray(v.keys)) {
    return false;
  }
  for (const entry of Object.values(v.keys as Record<string, unknown>)) {
    if (typeof entry !== "string") return false;
  }
  return true;
};
