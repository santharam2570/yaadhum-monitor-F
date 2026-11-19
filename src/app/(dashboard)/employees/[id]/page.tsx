import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Clock, Coffee, History, Laptop, Timer, TrendingUp } from "lucide-react";
import { getEmployeeDetail, getSettings } from "@/lib/data";
import { formatDuration, minutesToClock } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge, StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { UsageList } from "@/components/UsageList";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ScreenshotPreview } from "@/components/ScreenshotPreview";
import { HourlyActivityChart } from "@/components/charts/HourlyActivityChart";
import { ProductivityDonut } from "@/components/charts/ProductivityDonut";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [employee, settings] = await Promise.all([getEmployeeDetail(id), getSettings()]);
  if (!employee) notFound();

  const { today } = employee;
  const apps = employee.apps.filter((a) => a.kind === "app");
  const websites = employee.apps.filter((a) => a.kind === "website");
  const recentSpans = [...employee.spans].reverse().slice(0, 12);

  return (
    <div className="space-y-6">
      <Link
        href="/employees"
        className="inline-flex items-center gap-1.5 text-sm text-cream-400 hover:text-cream-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to employees
      </Link>

      <Card className="p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <Avatar name={employee.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-cream-50">{employee.name}</h2>
              <StatusBadge status={employee.status} />
            </div>
            <p className="mt-0.5 text-sm text-cream-400">
              {[employee.role, employee.team, employee.email].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 truncate text-xs text-cream-400">{employee.currentActivity}</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-ink-850 px-4 py-3 text-sm">
            <Laptop className="h-5 w-5 text-cream-400" />
            <div>
              {employee.device ? (
                <>
                  <p className="font-medium text-cream-100">{employee.device.hostname || "Unknown device"}</p>
                  <p className="text-xs text-cream-400">
                    {employee.device.os}
                    {employee.device.agentVersion && ` · Agent v${employee.device.agentVersion}`}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-cream-100">No device yet</p>
                  <p className="text-xs text-cream-400">Desktop agent not installed</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tracked"
          value={formatDuration(today.totalSec)}
          hint={
            today.totalSec
              ? `${minutesToClock(today.firstSeenMin)} – ${minutesToClock(today.lastSeenMin)}`
              : "No activity today"
          }
          icon={Timer}
          tone="sky"
        />
        <StatCard label="Active time" value={formatDuration(today.activeSec)} icon={Clock} tone="brand" />
        <StatCard label="Idle time" value={formatDuration(today.idleSec)} hint="Includes breaks" icon={Coffee} tone="amber" />
        <StatCard label="Productivity" value={`${today.productivity}%`} icon={TrendingUp} tone="emerald" />
      </div>

      <Card>
        <CardHeader title="Today's timeline" description="Hover a block to see the app and window title" />
        <div className="px-5 pb-5">
          <ActivityTimeline spans={employee.spans} workStart={settings.workStart} workEnd={settings.workEnd} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Activity by hour" description="Minutes per category" />
          <div className="h-72 px-2 pb-4">
            <HourlyActivityChart data={employee.hourly} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Productivity split" />
          <ProductivityDonut
            productiveSec={today.productiveSec}
            neutralSec={today.neutralSec}
            unproductiveSec={today.unproductiveSec}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Applications" />
          <UsageList items={apps} limit={8} emptyTitle="No app usage recorded today" />
        </Card>
        <Card>
          <CardHeader title="Websites" />
          <UsageList items={websites} limit={8} emptyTitle="No website visits recorded today" />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent screenshots"
            description="Captured when the employee opens an app or website"
            action={
              employee.screenshots.length > 0 && (
                <Link
                  href={`/screenshots?employee=${employee.id}`}
                  className="text-xs font-medium text-brand-300 hover:text-brand-200"
                >
                  View all
                </Link>
              )
            }
          />
          {employee.screenshots.length ? (
            <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-3">
              {employee.screenshots.slice(0, 6).map((shot) => (
                <div key={shot.id}>
                  <ScreenshotPreview shot={shot} blur={settings.blurScreenshots} />
                  <p className="mt-1 truncate text-xs text-cream-400">
                    {minutesToClock(shot.takenAtMin)} · {shot.app}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Camera} className="pb-8" title="No screenshots captured today" />
          )}
        </Card>

        <Card>
          <CardHeader title="Activity log" description="Most recent first" />
          {recentSpans.length ? (
            <div className="overflow-x-auto pb-2">
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-ink-600">
                  {recentSpans.map((s) => (
                    <tr key={`${s.start}-${s.end}`}>
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs text-cream-400">
                        {minutesToClock(s.start)} – {minutesToClock(s.end)}
                      </td>
                      <td className="max-w-[220px] px-2 py-2.5">
                        <p className="truncate font-medium text-cream-100">{s.app}</p>
                        <p className="truncate text-xs text-cream-400">{s.title}</p>
                      </td>
                      <td className="px-2 py-2.5">
                        <CategoryBadge category={s.category} />
                      </td>
                      <td className="px-5 py-2.5 text-right whitespace-nowrap text-cream-300">
                        {formatDuration((s.end - s.start) * 60)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={History} className="pb-8" title="No activity recorded today" />
          )}
        </Card>
      </div>
    </div>
  );
}
