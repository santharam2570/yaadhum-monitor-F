import type { AppUsage } from "@/lib/types";
import { CATEGORY_STYLES, cn, formatDuration } from "@/lib/utils";
import { EmptyState } from "@/components/ui/States";

export function UsageList({
  items,
  limit = 6,
  emptyTitle = "No usage recorded yet",
}: {
  items: AppUsage[];
  limit?: number;
  emptyTitle?: string;
}) {
  const top = items.slice(0, limit);
  const max = top[0]?.seconds || 1;

  if (!top.length) {
    return <EmptyState className="pt-2 pb-8" title={emptyTitle} />;
  }

  return (
    <ul className="space-y-4 px-5 pb-5">
      {top.map((item) => {
        const style = CATEGORY_STYLES[item.category];
        return (
          <li key={item.name}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium text-cream-200">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 text-cream-400">{formatDuration(item.seconds)}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-700">
              <div
                className={cn("h-full rounded-full", style.dot)}
                style={{ width: `${(item.seconds / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
