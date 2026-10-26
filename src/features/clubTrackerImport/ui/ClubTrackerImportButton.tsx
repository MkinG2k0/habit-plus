import { useRef, useState } from "react";
import { useQuizOnboardingStore } from "@/features/lifeBalanceQuiz/slice/quizOnboardingStore";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { cn } from "@/shared/ui/lib/utils";
import {
  CLUB_IMPORT_QUIZ_HINT,
  importClubTrackerFile,
} from "../lib/importClubTrackerFile";
import { ClubTrackerParseError } from "../lib/parseClubTrackerXlsx";

type ImportStatus =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

interface ClubTrackerImportButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  label?: string;
  showStatus?: boolean;
  /** После импорта пометить квиз как пропущенный (по умолчанию да). */
  skipQuizOnImport?: boolean;
  onSuccess?: (message: string) => void;
}

export const ClubTrackerImportButton = ({
  className,
  variant = "outline",
  size = "default",
  label = "Импорт таблицы клуба",
  showStatus = true,
  skipQuizOnImport = true,
  onSuccess,
}: ClubTrackerImportButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const markQuizDone = useQuizOnboardingStore((s) => s.markQuizDone);
  const [status, setStatus] = useState<ImportStatus>({ kind: "idle" });

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setStatus({ kind: "busy" });
    try {
      const outcome = await importClubTrackerFile(file);
      const message = skipQuizOnImport
        ? `${outcome.statsMessage} ${CLUB_IMPORT_QUIZ_HINT}`
        : outcome.statsMessage;
      if (skipQuizOnImport) {
        markQuizDone();
      }
      setStatus({ kind: "ok", message });
      onSuccess?.(message);
    } catch (err) {
      const message =
        err instanceof ClubTrackerParseError
          ? err.message
          : "Не удалось импортировать Excel.";
      setStatus({ kind: "error", message });
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onPick(file);
        }}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        className="w-full"
        disabled={status.kind === "busy"}
        onClick={() => inputRef.current?.click()}
      >
        {status.kind === "busy" ? "Читаю таблицу…" : label}
      </Button>
      {showStatus && status.kind === "ok" ? (
        <p className="text-sm text-chart-2" role="status">
          {status.message}
        </p>
      ) : null}
      {showStatus && status.kind === "error" ? (
        <p className="text-sm text-destructive" role="status">
          {status.message}
        </p>
      ) : null}
    </div>
  );
};
