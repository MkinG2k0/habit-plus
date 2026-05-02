import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/shadCNComponents/ui/drawer";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { cn } from "@/shared/ui/lib/utils";
import { LUCIDE_PICKER_ICON_GROUPS } from "@/shared/lib/lucidePickerIcons";

import { EmojiStyle, Theme } from "emoji-picker-react";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const EMOJI_PREFIX = "emoji:";

type TabId = "icon" | "emoji";

interface HabitIconPickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (next: string) => void;
  accentColor: string;
}

export const HabitIconPickerDrawer = ({
  open,
  onOpenChange,
  value,
  onChange,
  accentColor,
}: HabitIconPickerDrawerProps) => {
  const [tab, setTab] = useState<TabId>("icon");
  const [iconSearch, setIconSearch] = useState("");

  useEffect(() => {
    if (open) {
      setTab(value.startsWith(EMOJI_PREFIX) ? "emoji" : "icon");
      setIconSearch("");
    }
  }, [open, value]);

  const filteredGroups = useMemo(() => {
    const q = iconSearch.trim().toLowerCase();
    if (!q) {
      return LUCIDE_PICKER_ICON_GROUPS.map((g) => ({
        title: g.title,
        icons: [...g.icons],
      }));
    }
    return LUCIDE_PICKER_ICON_GROUPS.map((g) => ({
      title: g.title,
      icons: g.icons.filter((e) => e.name.toLowerCase().includes(q)),
    })).filter((g) => g.icons.length > 0);
  }, [iconSearch]);

  const hasSearch = iconSearch.trim().length > 0;

  const handleEmojiPick = (data: { emoji: string }) => {
    onChange(`${EMOJI_PREFIX}${data.emoji}`);
    onOpenChange(false);
  };

  const handleLucidePick = (name: string) => {
    onChange(name);
    onOpenChange(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      scrollLockTimeout={900}
    >
      <DrawerContent className="flex max-h-[92vh] min-h-[78dvh] flex-col">
        <DrawerHeader className="shrink-0 text-left">
          <DrawerTitle className="text-lg">Значок привычки</DrawerTitle>
        </DrawerHeader>

        <div className="shrink-0 px-4 pb-3">
          <div
            className="flex w-full rounded-xl border border-border bg-muted/50 p-1"
            role="tablist"
            aria-label="Тип значка"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "icon"}
              onClick={() => setTab("icon")}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                tab === "icon"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              Значок
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "emoji"}
              onClick={() => setTab("emoji")}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                tab === "emoji"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              Эмодзи
            </button>
          </div>
        </div>

        <div
          className="flex min-h-0 flex-1 touch-pan-y flex-col px-4 pb-2"
          data-vaul-no-drag
        >
          {tab === "icon" ? (
            <>
              <div className="relative mb-3 shrink-0">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Поиск на английском"
                  className="h-11 rounded-xl pl-10"
                />
              </div>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-1">
                {hasSearch && filteredGroups.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Ничего не найдено
                  </p>
                ) : null}
                {filteredGroups.map((group, gi) => (
                  <section
                    key={group.title}
                    aria-labelledby={`habit-icon-gr-${String(gi)}`}
                  >
                    <h3
                      id={`habit-icon-gr-${String(gi)}`}
                      className="mb-2 text-xs font-medium text-muted-foreground"
                    >
                      {group.title}
                    </h3>
                    <div className="grid grid-cols-6 gap-2 sm:grid-cols-7 md:grid-cols-8">
                      {group.icons.map(({ name, Icon }) => {
                        const selected = value === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => handleLucidePick(name)}
                            className={cn(
                              "flex aspect-square items-center justify-center rounded-xl border transition-colors",
                              selected
                                ? "border-primary bg-primary/15"
                                : "border-border bg-card hover:bg-muted/50",
                            )}
                            style={
                              selected
                                ? {
                                    borderColor: accentColor,
                                    backgroundColor: `${accentColor}26`,
                                  }
                                : undefined
                            }
                            aria-label={name}
                          >
                            <Icon
                              size={20}
                              strokeWidth={2}
                              fill="none"
                              stroke="currentColor"
                              className="text-foreground"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex h-[min(52dvh,400px)] min-h-[300px] w-full flex-col overflow-hidden overscroll-contain rounded-xl border border-border bg-card touch-pan-y">
                <Suspense
                  fallback={
                    <div
                      className="h-[min(52dvh,400px)] min-h-[300px] w-full animate-pulse bg-muted"
                      aria-hidden
                    />
                  }
                >
                  <div className="flex min-h-0 flex-1 flex-col">
                    <EmojiPicker
                      width="100%"
                      height="100%"
                      className="h-full min-h-0 flex-1"
                      lazyLoadEmojis
                      onEmojiClick={handleEmojiPick}
                      theme={Theme.DARK}
                      emojiStyle={EmojiStyle.NATIVE}
                      searchPlaceHolder="Поиск эмодзи"
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                </Suspense>
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="shrink-0 pt-1">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
