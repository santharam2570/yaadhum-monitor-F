import Link from "next/link";
import { Clock, Coffee, TrendingUp, Users } from "lucide-react";
import { getEmployees, getOverview } from "@/lib/data";
import { formatDuration } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { UsageList } from "@/components/UsageList";
import { HourlyActivityChart } from "@/components/charts/HourlyActivityChart";
import { ProductivityDonut } from "@/components/charts/ProductivityDonut";

export default async function DashboardPage() {
  const [overview, employees] = await Promise.all([getOverview(), getEmployees()]);
  const { counts } = overview;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Online now"
          value={`${counts.online} / ${employees.length}`}
          hint={`${counts.idle} idle · ${counts.offline} offline`}
          icon={Users}
          tone="emerald"
        />
        <StatCard
          label="Active time today"
          value={formatDuration(overview.totalActiveSec)}
          hint="Across all employees"
          icon={Clock}
          tone="brand"
        />
        <StatCard
          label="Idle time today"
          value={formatDuration(overview.totalIdleSec)}
          hint="Includes breaks"
          icon={Coffee}
          tone="amber"
        />
        <StatCard
          label="Avg productivity"
          value={`${overview.avgProductivity}%`}
          hint="Productive ÷ active time"
          icon={TrendingUp}
          tone="gold"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Team activity by hour" description="Minutes tracked across all employees today" />
          <div className="h-80 px-2 pb-4">
            <HourlyActivityChart data={overview.hourly} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Live status"
            description="As reported by each desktop agent"
            action={
              employees.length > 0 && (
                <Link href="/employees" className="text-xs font-medium text-brand-300 hover:text-brand-200">
                  View all
                </Link>
              )
            }
          />
          {employees.length ? (
            <ul className="divide-y divide-ink-600 pb-2">
              {employees.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/employees/${e.id}`}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-ink-850"
                  >
                    <Avatar name={e.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-cream-100">{e.name}</p>
                      <p className="truncate text-xs text-cream-400">{e.currentActivity}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              className="pb-10"
              title="No employees yet"
              description="Install the desktop agent on employee computers using your company code."
              action={
                <Link
                  href="/settings?tab=agent"
                  className="text-sm font-medium text-brand-300 hover:text-brand-200"
                >
                  Set up the agent
                </Link>
              }
            />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Productivity split" description="Active time by category" />
          <ProductivityDonut
            productiveSec={overview.productiveSec}
            neutralSec={overview.neutralSec}
            unproductiveSec={overview.unproductiveSec}
          />
        </Card>
        <Card>
          <CardHeader title="Top applications" description="Most used desktop apps today" />
          <UsageList items={overview.topApps} emptyTitle="No app usage recorded today" />
        </Card>
        <Card>
          <CardHeader title="Top websites" description="Most visited domains today" />
          <UsageList items={overview.topWebsites} emptyTitle="No website visits recorded today" />
        </Card>
      </div>
    </div>
  );
}
