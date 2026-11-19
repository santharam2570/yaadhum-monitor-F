"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import type { CurrentUser } from "@/lib/types";
import { logoutAction } from "@/app/login/actions";
import { Avatar } from "@/components/ui/Avatar";
import { NAV_ITEMS, isActive } from "./nav";

export function Topbar({
  user,
  companyName,
  onMenu,
}: {
  user: CurrentUser;
  companyName: string;
  onMenu: () => void;
}) {
  const pathname = usePathname();
  const title = NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label ?? "Dashboard";
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date()),
    );
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-ink-600/80 bg-ink-900/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-md p-1.5 text-cream-400 hover:bg-ink-700 hover:text-cream-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div>
        <h1 className="text-lg font-semibold text-cream-50">{title}</h1>
        <p className="h-4 text-xs text-cream-400">{today}</p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2.5 sm:flex">
          <Avatar name={user.name} size="sm" />
          <div className="leading-tight">
            <p className="text-sm font-medium text-cream-100">{user.name}</p>
            <p className="text-xs text-cream-400">
              <span className="capitalize">{user.role}</span> · {companyName}
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md p-1.5 text-cream-400 hover:bg-ink-700 hover:text-cream-100"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
