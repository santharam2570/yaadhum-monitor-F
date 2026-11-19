"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/States";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #2a2a2a",
  background: "#161616",
  color: "#f7f0e6",
  fontSize: 12,
};

export function WeeklyHoursChart({ data }: { data: { day: string; hours: number }[] }) {
  if (!data.some((d) => d.hours > 0)) {
    return (
      <EmptyState
        icon={BarChart3}
        className="h-full"
        title="No active hours this week"
        description="Hours appear once desktop agents report activity."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="#9a8f84" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9a8f84" />
        <Tooltip
          cursor={{ fill: "rgba(200,16,46,0.08)" }}
          formatter={(value) => [`${value} h`, "Active hours"]}
          contentStyle={tooltipStyle}
        />
        <Bar dataKey="hours" fill="#c8102e" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
