import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

const TONES = {
  brand: "bg-brand-600/15 text-brand-300 ring-1 ring-brand-600/25",
  emerald: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",
  amber: "bg-brand-300/15 text-brand-200 ring-1 ring-brand-300/25",
  gold: "bg-brand-200/10 text-brand-200 ring-1 ring-brand-200/20",
  rose: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25",
  sky: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-cream-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-cream-50">{value}</p>
          {hint && <p className="mt-1 text-xs text-cream-500">{hint}</p>}
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", TONES[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}
