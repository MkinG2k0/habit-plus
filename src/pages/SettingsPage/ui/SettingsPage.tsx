import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";

interface SettingsItem {
  icon: string;
  label: string;
  iconClass: string;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const ICON_BOX = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-sidebar-primary",
] as const;

export const SettingsPage = () => {
  const navigate = useNavigate();

  const sections: SettingsSection[] = [
    {
      title: "Приложение",
      items: [
        { icon: "⚙️", label: "Основные", iconClass: ICON_BOX[0] },
        {
          icon: "🔔",
          label: "Ежедневные напоминания о проверке",
          iconClass: ICON_BOX[1],
        },
        { icon: "🎨", label: "Тема", iconClass: ICON_BOX[2] },
        { icon: "📦", label: "Архив привычек", iconClass: ICON_BOX[3] },
        { icon: "📤", label: "Импорт/Экспорт данных", iconClass: ICON_BOX[4] },
        { icon: "📋", label: "Отсортировать привычки", iconClass: ICON_BOX[5] },
      ],
    },
    {
      title: "Помощь",
      items: [
        { icon: "🚀", label: "Show Onboarding", iconClass: ICON_BOX[0] },
        { icon: "📰", label: "Show What's New", iconClass: ICON_BOX[1] },
        { icon: "✉️", label: "Обратная связь", iconClass: ICON_BOX[2] },
      ],
    },
    {
      title: "Информация о приложении",
      items: [
        { icon: "🌐", label: "Сайт", iconClass: ICON_BOX[3] },
        {
          icon: "🔒",
          label: "Политика конфиденциальности",
          iconClass: ICON_BOX[4],
        },
      ],
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex shrink-0 items-center border-b border-border px-4 py-3.5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-8 items-center justify-center text-muted-foreground"
          aria-label="Закрыть"
        >
          <CloseIcon />
        </button>
        <div className="flex-1 text-center text-lg font-semibold">Настройки</div>
        <div className="size-8" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
        <button
          type="button"
          className="mb-5 flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3.5 text-left"
        >
          <div
            className="grid size-11 shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-gradient-to-br from-chart-2 via-chart-4 to-chart-1 p-1.5"
            aria-hidden
          >
            <div className="rounded-sm bg-primary-foreground/35" />
            <div className="rounded-sm bg-primary-foreground/35" />
            <div className="rounded-sm bg-primary-foreground/35" />
            <div className="rounded-sm bg-primary-foreground/35" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              Подписаны на{" "}
              <span className="text-chart-1">habit+ Pro</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Безлимитные привычки, импорт/экспо...
            </p>
          </div>
          <ChevronIcon />
        </button>

        {sections.map((sec) => (
          <div key={sec.title} className="mb-5">
            <div className="mb-2 pl-1 text-[13px] font-medium text-muted-foreground">
              {sec.title}
            </div>
            <Card className="overflow-hidden border shadow-none">
              <ul className="divide-y divide-border">
                {sec.items.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg text-base",
                          item.iconClass,
                        )}
                      >
                        {item.icon}
                      </div>
                      <span className="flex-1 text-[15px] text-foreground">
                        {item.label}
                      </span>
                      <ChevronIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

function CloseIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
