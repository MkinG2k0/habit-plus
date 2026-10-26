import * as XLSX from "xlsx";
import type { ClubTrackerHabitImport, ClubTrackerParseResult } from "./types";

const MONTH_SHEET_TO_INDEX: Record<string, number> = {
  январь: 1,
  февраль: 2,
  март: 3,
  апрель: 4,
  май: 5,
  июнь: 6,
  июль: 7,
  август: 8,
  сентябрь: 9,
  октябрь: 10,
  ноябрь: 11,
  декабрь: 12,
};

const SKIP_SHEETS = new Set(["список кодов"]);

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function normalizeSheetName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function monthFromSheetName(name: string): number | null {
  const key = normalizeSheetName(name);
  for (const [label, month] of Object.entries(MONTH_SHEET_TO_INDEX)) {
    if (key === label || key.startsWith(label)) return month;
  }
  return null;
}

function parseYearFromTitle(cell: unknown, fallback: number): number {
  if (typeof cell !== "string") return fallback;
  const m = cell.match(/(\d{2,4})\s*$/);
  if (!m?.[1]) return fallback;
  const raw = Number(m[1]);
  if (!Number.isFinite(raw)) return fallback;
  if (raw < 100) return 2000 + raw;
  return raw;
}

function cellName(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return String(value).trim();
}

function isTruthyCheck(value: unknown): boolean {
  if (value === true) return true;
  if (value === 1) return true;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "x" || v === "✓" || v === "v";
  }
  return false;
}

function rowHasDayBooleans(days: unknown[]): boolean {
  return days.some((d) => typeof d === "boolean" || d === 1 || d === 0);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Парсит xlsx «КОД Трекер» клуба: листы месяцев, секции-категории, галочки по дням.
 */
export function parseClubTrackerWorkbook(
  data: ArrayBuffer,
  opts?: { defaultYear?: number },
): ClubTrackerParseResult {
  const defaultYear = opts?.defaultYear ?? new Date().getFullYear();
  const wb = XLSX.read(data, { type: "array", cellDates: false });

  let year = defaultYear;
  const byName = new Map<
    string,
    { name: string; categoryLabel: string | null; completions: Record<string, true> }
  >();

  for (const sheetName of wb.SheetNames) {
    const norm = normalizeSheetName(sheetName);
    if (SKIP_SHEETS.has(norm) || norm.includes("список")) continue;

    const month = monthFromSheetName(sheetName);
    if (!month) continue;

    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
      sheet,
      { header: 1, defval: "", raw: true },
    );
    if (rows.length < 4) continue;

    year = parseYearFromTitle(rows[0]?.[1], year);
    const maxDay = daysInMonth(year, month);
    let currentCategory: string | null = null;

    for (let r = 3; r < rows.length; r++) {
      const row = rows[r];
      if (!row || !row.length) continue;

      const nameRaw = cellName(row[0]);
      const dayCells = row.slice(1, 1 + maxDay);

      // Секция-категория: есть название, нет булевых дней
      if (nameRaw && !rowHasDayBooleans(dayCells)) {
        currentCategory = nameRaw;
        continue;
      }

      if (!nameRaw) continue;
      if (!rowHasDayBooleans(dayCells)) continue;

      const matchKey = nameRaw.toLowerCase();
      let entry = byName.get(matchKey);
      if (!entry) {
        entry = {
          name: nameRaw,
          categoryLabel: currentCategory,
          completions: {},
        };
        byName.set(matchKey, entry);
      } else if (!entry.categoryLabel && currentCategory) {
        entry.categoryLabel = currentCategory;
      }

      for (let i = 0; i < maxDay; i++) {
        if (!isTruthyCheck(dayCells[i])) continue;
        entry.completions[toDateKey(year, month, i + 1)] = true;
      }
    }
  }

  const habits: ClubTrackerHabitImport[] = [...byName.values()].filter(
    (h) => Object.keys(h.completions).length > 0 || h.name.length > 0,
  );

  // Только привычки с хотя бы одним именем; пустые слоты без имени уже отфильтрованы.
  // Оставляем даже без галочек, если имя есть — пользователь мог завести КОД без отметок.
  const named = habits.filter((h) => h.name.length > 0);

  let checkedCount = 0;
  for (const h of named) checkedCount += Object.keys(h.completions).length;

  return { year, habits: named, checkedCount };
}

export class ClubTrackerParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClubTrackerParseError";
  }
}

export async function readClubTrackerFromFile(
  file: File,
): Promise<ClubTrackerParseResult> {
  const buf = await file.arrayBuffer();
  try {
    const result = parseClubTrackerWorkbook(buf);
    if (!result.habits.length) {
      throw new ClubTrackerParseError(
        "В файле нет привычек с названиями. Проверьте формат «КОД Трекер».",
      );
    }
    return result;
  } catch (err) {
    if (err instanceof ClubTrackerParseError) throw err;
    throw new ClubTrackerParseError(
      "Не удалось прочитать Excel. Нужен файл «КОД Трекер» (.xlsx).",
    );
  }
}
