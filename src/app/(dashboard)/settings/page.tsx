import { getCurrentUser, getSettings } from "@/lib/data";
import { getAgentDownloads } from "@/lib/resources";
import { SettingsForm, type SettingsTab } from "@/components/SettingsForm";

const TAB_IDS: SettingsTab[] = ["general", "screenshots", "categories", "agent"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ tab }, settings, user, downloads] = await Promise.all([
    searchParams,
    getSettings(),
    getCurrentUser(),
    getAgentDownloads(),
  ]);
  const initialTab = TAB_IDS.find((id) => id === tab) ?? "general";
  const canEdit = user.role === "admin";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-cream-50">Settings</h2>
        <p className="text-sm text-cream-400">
          Configure tracking rules for {settings.companyName}.
          {!canEdit && " Only admins can make changes."}
        </p>
      </div>
      <SettingsForm
        key={initialTab}
        initial={settings}
        initialTab={initialTab}
        canEdit={canEdit}
        downloads={{
          windows: downloads.windows.url,
          macos: downloads.macos.url,
          version: downloads.windows.version || downloads.macos.version,
          installSteps: downloads.installSteps,
          mdmHint: downloads.mdmHint,
        }}
      />
    </div>
  );
}
