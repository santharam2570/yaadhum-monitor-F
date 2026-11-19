import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-ink-600/90 bg-ink-850/90 shadow-[0_1px_0_0_rgba(255,184,77,0.04)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
      <div>
        <h3 className="text-sm font-semibold text-cream-50">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-cream-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
