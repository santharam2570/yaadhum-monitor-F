import { getCurrentUser, getSettings } from "@/lib/data";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  return (
    <DashboardShell user={user} companyName={settings.companyName}>
      {children}
    </DashboardShell>
  );
}
