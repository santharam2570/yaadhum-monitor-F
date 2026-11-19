import { cn } from "@/lib/utils";

export function ProductivityBar({ value }: { value: number }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-brand-300" : "bg-brand-600";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-700">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-cream-300">{value}%</span>
    </div>
  );
}
