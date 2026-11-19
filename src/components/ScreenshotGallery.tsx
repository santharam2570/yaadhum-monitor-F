"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Camera, ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import type { Category, Screenshot } from "@/lib/types";
import { cn, minutesToClock } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { ScreenshotPreview } from "@/components/ScreenshotPreview";

const selectCls =
  "rounded-lg border border-ink-500 bg-ink-850 px-3 py-2 text-sm text-cream-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-600/25";

export function ScreenshotGallery({
  screenshots,
  employees,
  employee,
  date,
  blur,
}: {
  screenshots: Screenshot[];
  employees: { id: string; name: string }[];
  employee?: string;
  date?: string;
  blur: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, startTransition] = useTransition();
  const [category, setCategory] = useState<"all" | Category>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  function navigate(next: { employee?: string; date?: string }) {
    const params = new URLSearchParams();
    const nextEmployee = "employee" in next ? next.employee : employee;
    const nextDate = "date" in next ? next.date : date;
    if (nextEmployee) params.set("employee", nextEmployee);
    if (nextDate) params.set("date", nextDate);
    const qs = params.toString();
    setSelected(null);
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return screenshots.filter(
      (s) =>
        (category === "all" || s.category === category) &&
        (!q || s.app.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)),
    );
  }, [screenshots, category, query]);

  const current = selected !== null ? filtered[selected] : null;

  useEffect(() => {
    if (selected === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowRight") setSelected((i) => (i === null ? i : Math.min(i + 1, filtered.length - 1)));
      if (e.key === "ArrowLeft") setSelected((i) => (i === null ? i : Math.max(i - 1, 0)));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, filtered.length]);

  const hasLocalFilters = category !== "all" || query.trim() !== "";

  return (
    <>
      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-600/80 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-cream-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by app or window title"
              className="w-full rounded-lg border border-ink-500 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-600/25"
            />
          </div>
          <input
            type="date"
            value={date ?? ""}
            onChange={(e) => navigate({ date: e.target.value || undefined })}
            className={selectCls}
            aria-label="Date"
          />
          <select
            value={employee ?? "all"}
            onChange={(e) => navigate({ employee: e.target.value === "all" ? undefined : e.target.value })}
            className={selectCls}
          >
            <option value="all">All employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className={selectCls}
          >
            <option value="all">All categories</option>
            <option value="productive">Productive</option>
            <option value="neutral">Neutral</option>
            <option value="unproductive">Unproductive</option>
          </select>
        </div>

        <p className="flex items-center gap-2 px-4 pt-4 text-xs text-cream-400">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading
            ? "Loading screenshots…"
            : `${filtered.length} screenshot${filtered.length === 1 ? "" : "s"} ${date ? `on ${date}` : "today"}`}
        </p>

        <div
          className={cn(
            "grid grid-cols-1 gap-4 p-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
            loading && "pointer-events-none opacity-50",
          )}
        >
          {filtered.map((shot, i) => (
            <button
              key={shot.id}
              onClick={() => setSelected(i)}
              className="group rounded-xl border border-ink-600 bg-ink-850 p-2 text-left transition-shadow hover:shadow-md"
            >
              <ScreenshotPreview shot={shot} blur={blur} />
              <div className="mt-2 flex items-center gap-2 px-1 pb-1">
                <Avatar name={shot.employeeName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-cream-100">{shot.employeeName}</p>
                  <p className="truncate text-xs text-cream-400">
                    {minutesToClock(shot.takenAtMin)} · {shot.app}
                  </p>
                </div>
                <CategoryBadge category={shot.category} />
              </div>
            </button>
          ))}
        </div>

        {!filtered.length && !loading && (
          <EmptyState
            icon={Camera}
            className="pb-12"
            title={hasLocalFilters ? "No screenshots match your filters" : "No screenshots for this day"}
            description={
              hasLocalFilters
                ? "Try a different search or category."
                : "Screenshots appear here once desktop agents upload them."
            }
          />
        )}
      </Card>

      {current && selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/85 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-ink-850 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-3">
              <Avatar name={current.employeeName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-cream-50">{current.employeeName}</p>
                <p className="truncate text-xs text-cream-400">
                  {minutesToClock(current.takenAtMin)} · {current.app} — {current.title}
                </p>
              </div>
              <CategoryBadge category={current.category} />
              <button
                onClick={() => setSelected(null)}
                className="rounded-md p-1.5 text-cream-400 hover:bg-ink-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ScreenshotPreview shot={current} blur={blur} size="lg" />

            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => setSelected(Math.max(selected - 1, 0))}
                disabled={selected === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-ink-600 px-3 py-1.5 text-sm text-cream-200 hover:bg-ink-850 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Newer
              </button>
              <span className="text-xs text-cream-400">
                {selected + 1} / {filtered.length}
              </span>
              <button
                onClick={() => setSelected(Math.min(selected + 1, filtered.length - 1))}
                disabled={selected === filtered.length - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-ink-600 px-3 py-1.5 text-sm text-cream-200 hover:bg-ink-850 disabled:opacity-40"
              >
                Older <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
