import { getWeeklyReport } from "@/lib/data";
import { ReportsView } from "@/components/ReportsView";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const date = params.date && DATE_RE.test(params.date) ? params.date : undefined;
  const report = await getWeeklyReport(date);
  return <ReportsView report={report} date={date} />;
}
