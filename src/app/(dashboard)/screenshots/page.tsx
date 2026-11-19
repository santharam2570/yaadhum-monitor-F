import { getEmployees, getScreenshots, getSettings } from "@/lib/data";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function ScreenshotsPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; date?: string }>;
}) {
  const params = await searchParams;
  const employee = params.employee || undefined;
  const date = params.date && DATE_RE.test(params.date) ? params.date : undefined;

  const [screenshots, employees, settings] = await Promise.all([
    getScreenshots({ date, employeeId: employee }),
    getEmployees(),
    getSettings(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-cream-50">Screenshots</h2>
        <p className="text-sm text-cream-400">
          Captured when an employee opens an app or website · kept for {settings.retentionDays} days
          {settings.blurScreenshots && " · blur enabled"}
        </p>
      </div>
      <ScreenshotGallery
        screenshots={screenshots}
        employees={employees.map(({ id, name }) => ({ id, name }))}
        employee={employee}
        date={date}
        blur={settings.blurScreenshots}
      />
    </div>
  );
}
