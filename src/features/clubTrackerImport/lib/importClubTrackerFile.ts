import { applyClubTrackerImport } from "./applyClubTrackerImport";
import { readClubTrackerFromFile } from "./parseClubTrackerXlsx";
import type { ClubTrackerApplyResult, ClubTrackerParseResult } from "./types";

export const CLUB_IMPORT_QUIZ_HINT =
  "Квиз баланса сфер можно пройти позже в Настройках.";

export interface ClubTrackerImportOutcome {
  parsed: ClubTrackerParseResult;
  result: ClubTrackerApplyResult;
  /** Статистика импорта без подсказки про квиз. */
  statsMessage: string;
}

export async function importClubTrackerFile(
  file: File,
): Promise<ClubTrackerImportOutcome> {
  const parsed = await readClubTrackerFromFile(file);
  const result = applyClubTrackerImport(parsed);

  return {
    parsed,
    result,
    statsMessage: `Импорт КОД Трекер (${parsed.year}): +${result.created} новых, обновлено ${result.updated}, отметок ${result.checkedDays}.`,
  };
}
