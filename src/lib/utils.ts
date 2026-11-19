import type { EmployeeStatus, SpanCategory } from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function minutesToClock(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatHour(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

export function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export const CATEGORY_STYLES: Record<
  SpanCategory,
  { label: string; dot: string; badge: string; hex: string }
> = {
  productive: {
    label: "Productive",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
    hex: "#34d399",
  },
  neutral: {
    label: "Neutral",
    dot: "bg-brand-300",
    badge: "bg-brand-300/15 text-brand-100 ring-brand-300/25",
    hex: "#f0a84a",
  },
  unproductive: {
    label: "Unproductive",
    dot: "bg-brand-500",
    badge: "bg-brand-600/20 text-brand-200 ring-brand-500/30",
    hex: "#c8102e",
  },
  idle: {
    label: "Idle",
    dot: "bg-ink-500",
    badge: "bg-ink-600 text-cream-300 ring-ink-500/40",
    hex: "#3d3d3d",
  },
};

export const STATUS_STYLES: Record<
  EmployeeStatus,
  { label: string; dot: string; badge: string }
> = {
  online: {
    label: "Online",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  },
  idle: {
    label: "Idle",
    dot: "bg-brand-300",
    badge: "bg-brand-300/15 text-brand-100 ring-brand-300/25",
  },
  offline: {
    label: "Offline",
    dot: "bg-cream-500",
    badge: "bg-ink-600 text-cream-300 ring-ink-500/40",
  },
};
