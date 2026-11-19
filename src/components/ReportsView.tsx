"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Clock, Download, Loader2, TrendingUp, Users } from "lucide-react";
import type { WeeklyReport } from "@/lib/types";
import { cn, round1 } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { ProductivityBar } from "@/components/ui/ProductivityBar";
import { EmptyState } from "@/components/ui/States";
import { WeeklyHoursChart } from "@/components/charts/WeeklyHoursChart";

const controlCls =
  "rounded-lg border border-ink-500 bg-ink-850 px-3 py-2 text-sm text-cream-200 outline-none focus:border-brand-500";

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function ReportsView({ report, date }: { report: WeeklyReport; date?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, startTransition] = useTransition();
  const [team, setTeam] = useState("all");

  const teams = useMemo(
    () => [...new Set(report.rows.map((r) => r.team).filter(Boolean))].sort(),
    [report.rows],
  );
  const rows = team === "all" ? report.rows : report.rows.filter((r) => r.team === team);

  const chartData = report.days.map((day, i) => ({
    day,
    hours: round1(rows.reduce((sum, r) => sum + (r.hours[i] ?? 0), 0)),
  }));
  const totalHours = round1(rows.reduce((sum, r) => sum + r.total, 0));
  const avgPerEmployee = rows.length ? round1(totalHours / rows.length) : 0;
  const avgProductivity = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.productivity, 0) / rows.length)
    : 0;

  function changeWeek(value: string) {
    startTransition(() => router.push(value ? `${pathname}?date=${value}` : pathname));
  }

  function exportCsv() {
    const header = ["Employee", "Team", ...report.days, "Total hours", "Productivity %"];
    const lines = rows.map((r) => [r.name, r.team, ...r.hours, r.total, r.productivity]);
    const csv = [header, ...lines].map((line) => line.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-report-${report.weekLabel.replace(/\W+/g, "-")}-${team}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-cream-50">Weekly report</h2>
          <p className="flex items-center gap-1.5 text-sm text-cream-400">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
            {report.weekLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={date ?? ""}
            onChange={(e) => changeWeek(e.target.value)}
            className={controlCls}
            aria-label="Any day in the week"
            title="Pick any day in the week"
          />
          {teams.length > 0 && (
            <select value={team} onChange={(e) => setTeam(e.target.value)} className={controlCls}>
              <option value="all">All teams</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={exportCsv}
            disabled={!rows.length}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-brand-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className={cn("space-y-6 transition-opacity", loading && "pointer-events-none opacity-50")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total active hours" value={`${totalHours} h`} icon={Clock} tone="brand" />
          <StatCard label="Avg per employee" value={`${avgPerEmployee} h`} icon={CalendarDays} tone="sky" />
          <StatCard label="Avg productivity" value={`${avgProductivity}%`} icon={TrendingUp} tone="emerald" />
        </div>

        <Card>
          <CardHeader title="Active hours per day" description={team === "all" ? "All teams" : team} />
          <div className="h-72 px-2 pb-4">
            <WeeklyHoursChart data={chartData} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Employee breakdown" description="Active hours per day" />
          {rows.length ? (
            <div className="overflow-x-auto pb-2">
              <table className="min-w-full text-sm">
                <thead className="bg-ink-850 text-left text-xs font-medium tracking-wide text-cream-400 uppercase">
                  <tr>
                    <th className="px-5 py-3">Employee</th>
                    {report.days.map((d) => (
                      <th key={d} className="px-3 py-3 text-center">
                        {d}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center">Total</th>
                    <th className="px-5 py-3">Productivity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-600">
                  {rows.map((r) => (
                    <tr key={r.employeeId} className="hover:bg-ink-850">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.name} size="sm" />
                          <span>
                            <span className="block font-medium text-cream-100">{r.name}</span>
                            {r.team && <span className="block text-xs text-cream-400">{r.team}</span>}
                          </span>
                        </div>
                      </td>
                      {r.hours.map((h, i) => (
                        <td key={i} className="px-3 py-3 text-center text-cream-300">
                          {h}
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center font-semibold text-cream-100">{r.total}</td>
                      <td className="px-5 py-3">
                        <ProductivityBar value={r.productivity} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              className="pb-10"
              title="No employees in this report"
              description="Employees appear here once their desktop agent reports activity."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
