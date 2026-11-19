import type { EmployeeStatus, SpanCategory } from "@/lib/types";
import { CATEGORY_STYLES, STATUS_STYLES, cn } from "@/lib/utils";

const base = "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

export function StatusBadge({ status }: { status: EmployeeStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn(base, s.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: SpanCategory }) {
  const s = CATEGORY_STYLES[category];
  return <span className={cn(base, s.badge)}>{s.label}</span>;
}
