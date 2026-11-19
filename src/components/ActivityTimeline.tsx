import type { ActivitySpan, SpanCategory } from "@/lib/types";
import { CATEGORY_STYLES, cn, formatHour, minutesToClock } from "@/lib/utils";
import { EmptyState } from "@/components/ui/States";

const LEGEND: SpanCategory[] = ["productive", "neutral", "unproductive", "idle"];

function clockToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Visible range covers the configured work hours, widened to include any activity outside them. */
function visibleRange(spans: ActivitySpan[], workStart: string, workEnd: string) {
  const firstStart = spans.length ? Math.min(...spans.map((s) => s.start)) : Infinity;
  const lastEnd = spans.length ? Math.max(...spans.map((s) => s.end)) : -Infinity;
  const startHour = Math.floor(Math.min(clockToMinutes(workStart), firstStart) / 60);
  const endHour = Math.min(24, Math.ceil(Math.max(clockToMinutes(workEnd), lastEnd) / 60));
  return { startHour, endHour: Math.max(endHour, startHour + 1) };
}

export function ActivityTimeline({
  spans,
  workStart,
  workEnd,
}: {
  spans: ActivitySpan[];
  workStart: string;
  workEnd: string;
}) {
  if (!spans.length) {
    return (
      <EmptyState
        className="py-6"
        title="No activity recorded today"
        description="Activity appears here once the desktop agent on this computer starts sending data."
      />
    );
  }

  const { startHour, endHour } = visibleRange(spans, workStart, workEnd);
  const dayStart = startHour * 60;
  const range = (endHour - startHour) * 60;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const labelEvery = hours.length > 13 ? 2 : 1;

  return (
    <div>
      <div className="relative h-10 overflow-hidden rounded-lg bg-ink-700">
        {spans.map((s) => {
          const start = Math.max(s.start, dayStart);
          const end = Math.min(s.end, dayStart + range);
          if (end <= start) return null;
          return (
            <div
              key={`${s.start}-${s.end}`}
              title={`${minutesToClock(s.start)}–${minutesToClock(s.end)} · ${s.app} — ${s.title}`}
              className={cn("absolute inset-y-0 border-r border-cream-50/40", CATEGORY_STYLES[s.category].dot)}
              style={{
                left: `${((start - dayStart) / range) * 100}%`,
                width: `${((end - start) / range) * 100}%`,
              }}
            />
          );
        })}
      </div>

      <div className="relative mt-2 h-4 text-[11px] text-cream-400">
        {hours.map((h, i) =>
          i % labelEvery === 0 || i === hours.length - 1 ? (
            <span
              key={h}
              className={cn(
                "absolute whitespace-nowrap",
                i === 0 ? "" : i === hours.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
              )}
              style={{ left: `${((h * 60 - dayStart) / range) * 100}%` }}
            >
              {formatHour(h % 24)}
            </span>
          ) : null,
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-cream-300">
        {LEGEND.map((c) => (
          <span key={c} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm", CATEGORY_STYLES[c].dot)} />
            {CATEGORY_STYLES[c].label}
          </span>
        ))}
      </div>
    </div>
  );
}
