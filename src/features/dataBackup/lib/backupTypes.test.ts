import { describe, expect, it } from "vitest";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  isHabitPlusBackup,
} from "./backupTypes";
import { buildBackupFileName, serializeBackup } from "./createBackupSnapshot";
import { BackupParseError, parseBackupJson } from "./parseBackupFile";

describe("isHabitPlusBackup", () => {
  it("accepts valid backups", () => {
    expect(
      isHabitPlusBackup({
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: "2026-10-26T00:00:00.000Z",
        keys: { "habit-plus-v1": "{}" },
      }),
    ).toBe(true);
  });

  it("rejects invalid shapes", () => {
    expect(isHabitPlusBackup(null)).toBe(false);
    expect(isHabitPlusBackup({ format: "other" })).toBe(false);
    expect(
      isHabitPlusBackup({
        format: BACKUP_FORMAT,
        version: 1,
        exportedAt: "x",
        keys: { a: 1 },
      }),
    ).toBe(false);
  });
});

describe("parseBackupJson", () => {
  it("parses valid JSON backup", () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: "2026-10-26T00:00:00.000Z",
      keys: { "habit-plus-v1": "{}" },
    });
    expect(parseBackupJson(raw).keys["habit-plus-v1"]).toBe("{}");
  });

  it("throws on bad JSON / wrong format / empty keys", () => {
    expect(() => parseBackupJson("{")).toThrow(BackupParseError);
    expect(() => parseBackupJson("{}")).toThrow(BackupParseError);
    expect(() =>
      parseBackupJson(
        JSON.stringify({
          format: BACKUP_FORMAT,
          version: BACKUP_VERSION,
          exportedAt: "x",
          keys: {},
        }),
      ),
    ).toThrow(BackupParseError);
  });
});

describe("serializeBackup / buildBackupFileName", () => {
  it("round-trips and names file by date", () => {
    const backup = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: "2026-10-26T00:00:00.000Z",
      keys: { a: "1" },
    } as const;
    expect(JSON.parse(serializeBackup(backup))).toEqual(backup);
    expect(buildBackupFileName(new Date(2026, 9, 26))).toBe(
      "habit-plus-backup-2026-10-26.json",
    );
  });
});
