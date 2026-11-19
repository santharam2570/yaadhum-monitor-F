import { cn } from "@/lib/utils";

const COLORS = [
  "bg-brand-600/25 text-brand-200",
  "bg-emerald-500/20 text-emerald-200",
  "bg-brand-300/20 text-brand-100",
  "bg-rose-500/20 text-rose-200",
  "bg-sky-500/20 text-sky-200",
  "bg-brand-800 text-brand-200",
];

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({ name, size = "md" }: { name: string; size?: keyof typeof SIZES }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = COLORS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % COLORS.length];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-ink-500",
        SIZES[size],
        color,
      )}
    >
      {initials}
    </span>
  );
}
