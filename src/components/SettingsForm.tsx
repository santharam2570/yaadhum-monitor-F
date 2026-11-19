"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  Apple,
  Camera,
  Check,
  Copy,
  Download,
  Monitor,
  Plus,
  RefreshCw,
  Settings2,
  Tags,
} from "lucide-react";
import type { Category, OrgSettings, UsageKind } from "@/lib/types";
import { rotateEnrollmentCodeAction, saveSettingsAction } from "@/app/(dashboard)/settings/actions";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";

const SETTINGS_TABS = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "screenshots", label: "Screenshots", icon: Camera },
  { id: "categories", label: "App categories", icon: Tags },
  { id: "agent", label: "Desktop agent", icon: Download },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]["id"];

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_INSTALL_STEPS = [
  "Download the installer for the employee's operating system.",
  "Run the installer and follow the prompts.",
  "Enter the company code and the employee's email when asked.",
  "On macOS, allow Screen Recording and Accessibility permissions in System Settings.",
  "The employee appears as Online on the dashboard within a minute.",
];
const DEFAULT_MDM_HINT =
  "Deploying to many computers? Your IT team can push the installer silently with Intune / Group Policy (Windows) or Jamf (macOS) and pre-fill the company code.";
const inputCls =
  "w-full rounded-lg border border-ink-500 bg-ink-850 px-3 py-2 text-sm text-cream-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-600/25 disabled:bg-ink-850 disabled:text-cream-400";

/** Keeps a value saved through the API selectable even when it isn't one of the preset choices. */
function withCurrent(options: number[], current: number) {
  return options.includes(current) ? options : [...options, current].sort((a, b) => a - b);
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-cream-100">{label}</span>
      {hint && <span className="block text-xs text-cream-400">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-cream-100">{label}</p>
        {description && <p className="text-xs text-cream-400">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-brand-600" : "bg-ink-600",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-cream-50 shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

export function SettingsForm({
  initial,
  initialTab,
  canEdit,
  downloads,
}: {
  initial: OrgSettings;
  initialTab: SettingsTab;
  canEdit: boolean;
  /** Installer links + help from GET /api/agent/downloads (not frontend env). */
  downloads: {
    windows: string | null;
    macos: string | null;
    version?: string | null;
    installSteps?: string[];
    mdmHint?: string | null;
  };
}) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [settings, setSettings] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<{ name: string; kind: UsageKind; category: Category }>({
    name: "",
    kind: "website",
    category: "productive",
  });

  const installSteps = downloads.installSteps?.length ? downloads.installSteps : DEFAULT_INSTALL_STEPS;
  const mdmHint = downloads.mdmHint === undefined ? DEFAULT_MDM_HINT : downloads.mdmHint;

  function update<K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const result = await saveSettingsAction(settings);
      if (!result.ok) {
        setSaveError(result.error);
        return;
      }
      setSettings(result.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day: string) {
    update(
      "workDays",
      settings.workDays.includes(day) ? settings.workDays.filter((d) => d !== day) : [...settings.workDays, day],
    );
  }

  function addRule() {
    const name = newRule.name.trim();
    if (!name || settings.categoryRules.some((r) => r.name.toLowerCase() === name.toLowerCase())) return;
    update("categoryRules", [{ ...newRule, name }, ...settings.categoryRules]);
    setNewRule((prev) => ({ ...prev, name: "" }));
  }

  async function copyCode() {
    await navigator.clipboard.writeText(settings.companyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function rotateCode() {
    if (!confirm("Generate a new company code? Agents that haven't enrolled yet will need the new code.")) return;
    setRotating(true);
    setRotateError(null);
    try {
      const result = await rotateEnrollmentCodeAction();
      if (result.ok) update("companyCode", result.settings.companyCode);
      else setRotateError(result.error);
    } catch {
      setRotateError("Could not generate a new code. Please try again.");
    } finally {
      setRotating(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap",
              tab === id ? "bg-ink-850 text-brand-200 shadow-sm ring-1 ring-ink-500" : "text-cream-300 hover:bg-ink-850",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <form onSubmit={handleSave}>
        <Card className="p-6">
          <fieldset disabled={!canEdit} className="min-w-0">
          {tab === "general" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-cream-50">General</h3>
              <Field label="Company name">
                <input
                  value={settings.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Work starts" hint="Tracking begins at this time">
                  <input
                    type="time"
                    value={settings.workStart}
                    onChange={(e) => update("workStart", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Work ends" hint="Tracking stops after this time">
                  <input
                    type="time"
                    value={settings.workEnd}
                    onChange={(e) => update("workEnd", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div>
                <p className="text-sm font-medium text-cream-100">Working days</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset",
                        settings.workDays.includes(day)
                          ? "bg-brand-600 text-cream-50 ring-brand-600"
                          : "bg-ink-850 text-cream-300 ring-ink-500 hover:bg-ink-850",
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Idle threshold" hint="Mark as idle after no keyboard/mouse activity for">
                <select
                  value={settings.idleThresholdMin}
                  onChange={(e) => update("idleThresholdMin", Number(e.target.value))}
                  className={cn(inputCls, "sm:w-60")}
                >
                  {withCurrent([3, 5, 10, 15], settings.idleThresholdMin).map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </select>
              </Field>
              <div className="divide-y divide-ink-600 border-t border-ink-600/80">
                <Toggle
                  label="Track websites"
                  description="Requires the browser extension on Chrome / Edge"
                  checked={settings.trackWebsites}
                  onChange={(v) => update("trackWebsites", v)}
                />
              </div>
            </div>
          )}

          {tab === "screenshots" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-cream-50">Screenshots</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Repeat gap"
                  hint="A screenshot is taken when an employee opens an app or website. The same one is captured again only after this gap."
                >
                  <select
                    value={settings.screenshotIntervalMin}
                    onChange={(e) => update("screenshotIntervalMin", Number(e.target.value))}
                    className={inputCls}
                  >
                    {withCurrent([5, 10, 15, 30], settings.screenshotIntervalMin).map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Retention" hint="Older screenshots are deleted automatically">
                  <select
                    value={settings.retentionDays}
                    onChange={(e) => update("retentionDays", Number(e.target.value))}
                    className={inputCls}
                  >
                    {withCurrent([30, 60, 90, 180], settings.retentionDays).map((d) => (
                      <option key={d} value={d}>
                        {d} days
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="divide-y divide-ink-600 border-t border-ink-600/80">
                <Toggle
                  label="Blur screenshots"
                  description="Protects sensitive information; managers see only the layout"
                  checked={settings.blurScreenshots}
                  onChange={(v) => update("blurScreenshots", v)}
                />
              </div>
            </div>
          )}

          {tab === "categories" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-cream-50">App categories</h3>
                <p className="text-sm text-cream-400">Used to calculate productivity scores.</p>
              </div>

              <div className="flex flex-col gap-2 rounded-lg bg-ink-850 p-3 sm:flex-row">
                <input
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="App name or domain, e.g. notion.so"
                  className={cn(inputCls, "flex-1")}
                />
                <select
                  value={newRule.kind}
                  onChange={(e) => setNewRule({ ...newRule, kind: e.target.value as UsageKind })}
                  className={cn(inputCls, "sm:w-32")}
                >
                  <option value="app">App</option>
                  <option value="website">Website</option>
                </select>
                <select
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value as Category })}
                  className={cn(inputCls, "sm:w-40")}
                >
                  <option value="productive">Productive</option>
                  <option value="neutral">Neutral</option>
                  <option value="unproductive">Unproductive</option>
                </select>
                <button
                  type="button"
                  onClick={addRule}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-cream-50 hover:bg-brand-500"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              {!settings.categoryRules.length && (
                <EmptyState
                  icon={Tags}
                  className="rounded-lg border border-dashed border-ink-600"
                  title="No category rules yet"
                  description="Add apps and websites above to mark them as productive, neutral or unproductive."
                />
              )}

              <ul
                className={cn(
                  "divide-y divide-ink-600 rounded-lg border border-ink-600",
                  !settings.categoryRules.length && "hidden",
                )}
              >
                {settings.categoryRules.map((rule, i) => (
                  <li key={rule.name} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-cream-100">{rule.name}</p>
                      <p className="text-xs text-cream-400 capitalize">{rule.kind}</p>
                    </div>
                    <CategoryBadge category={rule.category} />
                    <select
                      value={rule.category}
                      onChange={(e) =>
                        update(
                          "categoryRules",
                          settings.categoryRules.map((r, j) =>
                            j === i ? { ...r, category: e.target.value as Category } : r,
                          ),
                        )
                      }
                      className="rounded-md border border-ink-500 px-2 py-1 text-xs text-cream-200"
                    >
                      <option value="productive">Productive</option>
                      <option value="neutral">Neutral</option>
                      <option value="unproductive">Unproductive</option>
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </fieldset>

          {tab === "agent" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-cream-50">Desktop agent</h3>
                <p className="text-sm text-cream-400">
                  Install the agent on every employee computer. It runs in the background and links to your
                  organisation using the company code below.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-brand-600/30 bg-brand-600/15 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="text-xs font-medium tracking-wide text-brand-200 uppercase">Company code</p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-brand-100">{settings.companyCode}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyCode}
                    disabled={!settings.companyCode}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ink-850 px-3 py-2 text-sm font-medium text-brand-200 shadow-sm ring-1 ring-brand-600/40 hover:bg-brand-600/10 disabled:opacity-50"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy code"}
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={rotateCode}
                      disabled={rotating}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-ink-850 px-3 py-2 text-sm font-medium text-cream-200 shadow-sm ring-1 ring-ink-500 hover:bg-ink-850 disabled:opacity-50"
                    >
                      <RefreshCw className={cn("h-4 w-4", rotating && "animate-spin")} />
                      {rotating ? "Generating…" : "New code"}
                    </button>
                  )}
                </div>
              </div>
              {rotateError && (
                <p className="flex items-center gap-1.5 text-sm text-rose-300">
                  <AlertCircle className="h-4 w-4" /> {rotateError}
                </p>
              )}

              {downloads.windows || downloads.macos ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {downloads.windows && (
                    <a
                      href={downloads.windows}
                      className="flex items-center gap-3 rounded-xl border border-ink-600 p-4 hover:border-brand-500 hover:bg-brand-600/10"
                    >
                      <Monitor className="h-8 w-8 text-sky-400" />
                      <div>
                        <p className="text-sm font-semibold text-cream-50">Windows installer</p>
                        <p className="text-xs text-cream-400">
                          {downloads.version ? `Version ${downloads.version}` : "Download for Windows"}
                        </p>
                      </div>
                    </a>
                  )}
                  {downloads.macos && (
                    <a
                      href={downloads.macos}
                      className="flex items-center gap-3 rounded-xl border border-ink-600 p-4 hover:border-brand-500 hover:bg-brand-600/10"
                    >
                      <Apple className="h-8 w-8 text-cream-100" />
                      <div>
                        <p className="text-sm font-semibold text-cream-50">macOS installer</p>
                        <p className="text-xs text-cream-400">
                          {downloads.version ? `Version ${downloads.version}` : "Download for macOS"}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-ink-600 p-4 text-sm text-cream-400">
                  Installer download links haven&apos;t been configured on the backend yet
                  (AGENT_WINDOWS_URL / AGENT_MACOS_URL). Ask your administrator for the agent installer.
                </p>
              )}

              <div>
                <p className="text-sm font-semibold text-cream-50">Installation steps</p>
                <ol className="mt-3 space-y-3 text-sm text-cream-300">
                  {installSteps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-xs font-semibold text-brand-200">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {mdmHint ? <p className="rounded-lg bg-ink-850 p-3 text-xs text-cream-300">{mdmHint}</p> : null}
            </div>
          )}

          {tab !== "agent" && canEdit && (
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-ink-600/80 pt-5">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                  <Check className="h-4 w-4" /> Settings saved
                </span>
              )}
              {saveError && (
                <span className="flex items-center gap-1.5 text-sm text-rose-300">
                  <AlertCircle className="h-4 w-4" /> {saveError}
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </Card>
      </form>
    </div>
  );
}
