"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import type { Employee, EmployeeStatus } from "@/lib/types";
import { formatDuration, minutesToClock } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { ProductivityBar } from "@/components/ui/ProductivityBar";
import { EmptyState } from "@/components/ui/States";

const selectCls =
  "rounded-lg border border-ink-500 bg-ink-850 px-3 py-2 text-sm text-cream-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-600/25";

export function EmployeesTable({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | EmployeeStatus>("all");
  const [team, setTeam] = useState("all");

  const teams = useMemo(() => [...new Set(employees.map((e) => e.team))].sort(), [employees]);

  const filtered = employees.filter((e) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.role.toLowerCase().includes(q);
    return matchesQuery && (status === "all" || e.status === status) && (team === "all" || e.team === team);
  });

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-ink-600/80 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-cream-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or role"
            className="w-full rounded-lg border border-ink-500 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-600/25"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="online">Online</option>
          <option value="idle">Idle</option>
          <option value="offline">Offline</option>
        </select>
        <select value={team} onChange={(e) => setTeam(e.target.value)} className={selectCls}>
          <option value="all">All teams</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-850 text-left text-xs font-medium tracking-wide text-cream-400 uppercase">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Team</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Active today</th>
              <th className="px-5 py-3">Idle</th>
              <th className="px-5 py-3">Productivity</th>
              <th className="px-5 py-3">Device</th>
              <th className="px-5 py-3">Hours</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-600">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-ink-850">
                <td className="px-5 py-3">
                  <Link href={`/employees/${e.id}`} className="flex items-center gap-3">
                    <Avatar name={e.name} size="sm" />
                    <span>
                      <span className="block font-medium text-cream-100">{e.name}</span>
                      <span className="block text-xs text-cream-400">{e.role}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-cream-300">{e.team}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={e.status} />
                </td>
                <td className="px-5 py-3 font-medium text-cream-100">{formatDuration(e.today.activeSec)}</td>
                <td className="px-5 py-3 text-cream-300">{formatDuration(e.today.idleSec)}</td>
                <td className="px-5 py-3">
                  <ProductivityBar value={e.today.productivity} />
                </td>
                <td className="px-5 py-3 text-cream-300">
                  {e.device ? (
                    <>
                      <span className="block">{e.device.os}</span>
                      <span className="block text-xs text-cream-400">{e.device.hostname}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-cream-300">
                  {e.today.totalSec
                    ? `${minutesToClock(e.today.firstSeenMin)} – ${minutesToClock(e.today.lastSeenMin)}`
                    : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/employees/${e.id}`}
                    className="inline-flex items-center text-xs font-medium text-brand-300 hover:text-brand-200"
                  >
                    View <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!employees.length ? (
          <EmptyState
            icon={Users}
            title="No employees yet"
            description="Employees appear here once the desktop agent is installed and enrolled with your company code."
            action={
              <Link href="/settings?tab=agent" className="text-sm font-medium text-brand-300 hover:text-brand-200">
                Set up the agent
              </Link>
            }
          />
        ) : (
          !filtered.length && (
            <EmptyState icon={Search} title="No employees match your filters" description="Try a different search or filter." />
          )
        )}
      </div>
    </Card>
  );
}
