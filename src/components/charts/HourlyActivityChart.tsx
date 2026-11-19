"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import type { HourlyPoint } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/utils";
import { EmptyState } from "@/components/ui/States";

const SERIES = ["productive", "neutral", "unproductive", "idle"] as const;
const TOP_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #2a2a2a",
  background: "#161616",
  color: "#f7f0e6",
  fontSize: 12,
};

export function HourlyActivityChart({ data }: { data: HourlyPoint[] }) {
  const hasData = data.some((p) => SERIES.some((key) => p[key] > 0));
  if (!hasData) {
    return (
      <EmptyState
        icon={BarChart3}
        className="h-full"
        title="No activity tracked yet today"
        description="The chart fills in as desktop agents send activity."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a" />
        <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={12} stroke="#9a8f84" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9a8f84" />
        <Tooltip
          cursor={{ fill: "rgba(200,16,46,0.08)" }}
          formatter={(value) => `${Math.round(Number(value))} min`}
          contentStyle={tooltipStyle}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#c9bdb0" }} />
        {SERIES.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            name={CATEGORY_STYLES[key].label}
            stackId="activity"
            fill={CATEGORY_STYLES[key].hex}
            radius={key === "idle" ? TOP_RADIUS : 0}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
