import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/widgets";

interface AppLayoutProps {
  children: ReactNode;
}

function isHabitShellPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/add" ||
    pathname.startsWith("/edit/") ||
    pathname === "/settings"
  );
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const habitShell = isHabitShellPath(pathname);

  if (habitShell) {
    return (
      <div
        className="mx-auto flex h-dvh min-h-dvh w-full max-w-5xl flex-col overflow-hidden bg-background text-foreground
        pt-[max(0,env(safe-area-inset-top,0px))]
        pr-[max(0,env(safe-area-inset-right,0px))]
        pb-[max(0,env(safe-area-inset-bottom,0px))]
        pl-[max(0,env(safe-area-inset-left,0px))]"
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }

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
