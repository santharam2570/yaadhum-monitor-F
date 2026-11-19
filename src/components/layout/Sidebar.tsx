"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";
import { NAV_ITEMS, isActive } from "./nav";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-ink-950/70 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-600/80 bg-ink-900/95 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-600/80 px-4">
          <Link href="/dashboard" className="min-w-0" onClick={onClose}>
            <BrandLogo variant="lockup" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-cream-400 hover:bg-ink-700 hover:text-cream-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, href)
                  ? "bg-brand-600/15 text-brand-200 ring-1 ring-brand-600/30"
                  : "text-cream-400 hover:bg-ink-700 hover:text-cream-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="relative m-3 overflow-hidden rounded-xl bg-linear-to-br from-brand-700 via-brand-600 to-brand-800 p-4 text-cream-50 shadow-[0_0_24px_-8px_rgba(200,16,46,0.55)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,184,77,0.25),transparent_50%)]"
          />
          <p className="relative text-sm font-semibold">Desktop Agent</p>
          <p className="relative mt-1 text-xs text-brand-100/90">Install on employee PCs to start tracking.</p>
          <Link
            href="/settings?tab=agent"
            onClick={onClose}
            className="relative mt-3 inline-flex items-center gap-1.5 rounded-md bg-cream-50/15 px-2.5 py-1.5 text-xs font-medium hover:bg-cream-50/25"
          >
            <Download className="h-3.5 w-3.5" />
            Download agent
          </Link>
        </div>
      </aside>
    </>
  );
}
