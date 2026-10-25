import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  applyBackupSnapshot,
  BackupParseError,
  createBackupSnapshot,
  downloadOrShareBackup,
  readBackupFromFile,
  serializeBackup,
} from "@/features/dataBackup";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Card } from "@/shared/ui/shadCNComponents/ui/card";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; message: string }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

export const DataBackupPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const exportBackup = async () => {
    setStatus({ kind: "busy", message: "Собираю бэкап…" });
    try {
      const snapshot = await createBackupSnapshot();
      const keyCount = Object.keys(snapshot.keys).length;
      if (keyCount === 0) {
        setStatus({
          kind: "error",
          message: "Пока нечего сохранять — данных в приложении нет.",
        });
        return;
      }
      await downloadOrShareBackup(serializeBackup(snapshot));
      setStatus({
        kind: "ok",
        message:
          "Бэкап готов. Сохраните файл в Drive или Files — вне приложения.",
      });
    } catch {
      setStatus({
        kind: "error",
        message: "Не удалось экспортировать. Попробуйте ещё раз.",
      });
    }
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;

    const confirmed = window.confirm(
      "Импорт заменит текущие привычки и настройки данными из файла. Продолжить?",
    );
    if (!confirmed) return;

    setStatus({ kind: "busy", message: "Восстанавливаю…" });
    try {
      const backup = await readBackupFromFile(file);
      await applyBackupSnapshot(backup);
      setStatus({
        kind: "ok",
        message: "Готово. Перезагружаю приложение…",
      });
      window.setTimeout(() => {
        window.location.assign("/");
      }, 600);
    } catch (err) {
      const message =
        err instanceof BackupParseError
          ? err.message
          : "Не удалось импортировать файл.";
      setStatus({ kind: "error", message });
    }
  };

  const busy = status.kind === "busy";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex shrink-0 items-center border-b border-border px-4 py-3.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <BackIcon />
        </Button>
        <div className="flex-1 text-center text-lg font-semibold">
          Импорт / Экспорт
        </div>
        <div className="size-8" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Локальные данные пропадут при очистке телефона. Сохраните JSON-бэкап
          в облако или Files — и восстановите после сброса.
        </p>

        <Card className="mb-3 gap-0 overflow-hidden border p-0 shadow-none">
          <div className="border-b border-border px-4 py-3.5">
            <div className="text-[15px] font-medium">Экспорт</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Скачает или откроет «Поделиться» с файлом бэкапа.
            </p>
          </div>
          <div className="px-4 py-3.5">
            <Button
              type="button"
              className="w-full"
              disabled={busy}
              onClick={() => void exportBackup()}
            >
              Сохранить бэкап
            </Button>
          </div>
        </Card>

        <Card className="gap-0 overflow-hidden border p-0 shadow-none">
          <div className="border-b border-border px-4 py-3.5">
            <div className="text-[15px] font-medium">Импорт</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Заменит текущие данные содержимым файла бэкапа.
            </p>
          </div>
          <div className="px-4 py-3.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void onPickFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
            >
              Выбрать файл бэкапа
            </Button>
          </div>
        </Card>

        {status.kind !== "idle" ? (
          <p
            className={
              status.kind === "error"
                ? "mt-4 text-sm text-destructive"
                : status.kind === "ok"
                  ? "mt-4 text-sm text-chart-2"
                  : "mt-4 text-sm text-muted-foreground"
            }
            role="status"
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </div>
  );
};

function BackIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
