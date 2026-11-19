"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { CATEGORY_STYLES, cn, formatDuration } from "@/lib/utils";
import { EmptyState } from "@/components/ui/States";

export function ProductivityDonut({
  productiveSec,
  neutralSec,
  unproductiveSec,
}: {
  productiveSec: number;
  neutralSec: number;
  unproductiveSec: number;
}) {
  const data = (
    [
      ["productive", productiveSec],
      ["neutral", neutralSec],
      ["unproductive", unproductiveSec],
    ] as const
  ).map(([key, value]) => ({ key, value, name: CATEGORY_STYLES[key].label }));

  const total = productiveSec + neutralSec + unproductiveSec;
  const pct = total ? Math.round((productiveSec / total) * 100) : 0;

  if (!total) {
    return (
      <EmptyState
        icon={PieChartIcon}
        className="pb-8"
        title="No active time yet"
        description="Productivity is calculated from tracked app and website usage."
      />
    );
  }

  return (
    <div className="px-5 pb-5">
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.key} fill={CATEGORY_STYLES[d.key].hex} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatDuration(Number(value))}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #2a2a2a",
                background: "#161616",
                color: "#f7f0e6",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-cream-50">{pct}%</span>
          <span className="text-xs text-cream-400">productive</span>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2 text-center">
        {data.map((d) => (
          <li key={d.key} className="rounded-lg bg-ink-850 px-2 py-2">
            <span className="flex items-center justify-center gap-1.5 text-xs text-cream-400">
              <span className={cn("h-2 w-2 rounded-full", CATEGORY_STYLES[d.key].dot)} />
              {d.name}
            </span>
            <span className="mt-0.5 block text-sm font-semibold text-cream-100">
              {formatDuration(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
