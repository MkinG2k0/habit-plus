import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/widgets";

interface AppLayoutProps {
  children: ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  "/": "Main",
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div
      className="flex h-dvh min-h-dvh flex-col overflow-x-hidden overflow-y-auto gap-2 bg-background text-foreground
    mx-auto max-w-5xl
    pt-[max(0.75rem,env(safe-area-inset-top,0px))]
    pr-[max(0.5rem,env(safe-area-inset-right,0px))]
    pb-[max(1rem,env(safe-area-inset-bottom,0px))]
    pl-[max(0.5rem,env(safe-area-inset-left,0px))]"
    >
      <Header />
      {children}
    </div>
  );
};
