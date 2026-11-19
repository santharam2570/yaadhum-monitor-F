/**
 * Typed clients for APIs beyond the original dashboard reads in `data.ts`.
 *
 * How to map these to UI:
 * - Settings → Desktop agent     → getAgentDownloads
 * - Login / shell branding       → getBranding
 * - Settings form presets        → getSettingsSchema
 * - Employee self-service        → getMyActivity, getMyScreenshots
 * - Employee detail / Devices    → listEmployeeDevices, listDevices, revokeDevice
 * - Employees / Reports filters  → listTeams (+ team CRUD)
 * - Reports                      → getDailyReport, getRangeReport, getMonthlyReport, exportWeeklyReportCsv
 * - Settings → retention (admin) → getRetentionStatus, purgeRetention
 * - Users admin                  → listUsers, inviteUser, …
 * - Employees admin              → createEmployee, updateEmployee, deleteEmployee, listEmployeesPage
 * - Login extras                 → forgotPassword, resetPassword, acceptInvite, changePassword
 *
 * Existing screens keep using `data.ts`. Call these from new pages / server actions.
 */
import { cache } from "react";
import { apiFetch, apiFetchBlob } from "./api";
import type { AuthTokens } from "./session";
import type {
  AgentDownloads,
  Branding,
  DailyReport,
  Employee,
  EmployeeDetail,
  EmployeeInput,
  EmployeeListFilters,
  ForgotPasswordResult,
  ManagedDevice,
  MonthlyReport,
  OrgUser,
  Page,
  RangeReport,
  RetentionPurgeResult,
  RetentionStatus,
  Role,
  Screenshot,
  SettingsSchema,
  Team,
  UserInviteResult,
  WeeklyReport,
} from "./types";

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const out = search.toString();
  return out ? `?${out}` : "";
}

function dayParam(date?: string) {
  if (date) return date;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/* ─── Agent downloads (Settings → Desktop agent) ─── */

export const getAgentDownloads = cache(() => apiFetch<AgentDownloads>("/api/agent/downloads"));

/** Public — no auth. Product name / logo for login and shell. */
export async function getBranding(): Promise<Branding> {
  return apiFetch("/api/branding", { token: null });
}

export const getSettingsSchema = cache(() => apiFetch<SettingsSchema>("/api/settings/schema"));

/* ─── Self-service (linked employee by email) ─── */

export async function getMyActivity(date?: string): Promise<EmployeeDetail> {
  return apiFetch(`/api/me/activity${qs({ date: dayParam(date) })}`);
}

export async function getMyScreenshots(filters: {
  date?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<Page<Screenshot>> {
  return apiFetch(
    `/api/me/screenshots${qs({
      date: dayParam(filters.date),
      category: filters.category,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
    })}`,
  );
}

/* ─── Devices ─── */

export async function listEmployeeDevices(employeeId: string): Promise<ManagedDevice[]> {
  const res = await apiFetch<{ items: ManagedDevice[] }>(
    `/api/employees/${encodeURIComponent(employeeId)}/devices`,
  );
  return res.items;
}

export async function listDevices(filters: {
  page?: number;
  limit?: number;
  employeeId?: string;
  isRevoked?: boolean;
  sort?: string;
} = {}): Promise<Page<ManagedDevice>> {
  return apiFetch(
    `/api/devices${qs({
      page: filters.page,
      limit: filters.limit,
      employeeId: filters.employeeId,
      isRevoked: filters.isRevoked,
      sort: filters.sort,
    })}`,
  );
}

export async function revokeDevice(deviceId: string): Promise<ManagedDevice> {
  return apiFetch(`/api/devices/${encodeURIComponent(deviceId)}/revoke`, { method: "POST" });
}

/** Same as revoke; returns 204. */
export async function deleteDevice(deviceId: string): Promise<void> {
  await apiFetch(`/api/devices/${encodeURIComponent(deviceId)}`, { method: "DELETE" });
}

/* ─── Teams (filters / dropdowns) ─── */

export const getTeams = cache(async () => {
  const res = await apiFetch<{ items: Team[] }>("/api/teams");
  return res.items;
});

export async function createTeam(name: string): Promise<Team> {
  return apiFetch("/api/teams", { method: "POST", body: { name } });
}

export async function updateTeam(teamId: string, name: string): Promise<Team> {
  return apiFetch(`/api/teams/${encodeURIComponent(teamId)}`, { method: "PATCH", body: { name } });
}

/** Admin only. Clears matching free-text team on employees. */
export async function deleteTeam(teamId: string): Promise<void> {
  await apiFetch(`/api/teams/${encodeURIComponent(teamId)}`, { method: "DELETE" });
}

/* ─── Reports (extra ranges + CSV export) ─── */

export async function getWeeklyReportFiltered(date?: string, team?: string): Promise<WeeklyReport> {
  return apiFetch(`/api/reports/weekly${qs({ date: dayParam(date), team })}`);
}

export async function exportWeeklyReportCsv(date?: string, team?: string): Promise<{ blob: Blob; filename: string }> {
  const { blob, filename } = await apiFetchBlob(
    `/api/reports/weekly/export${qs({ date: dayParam(date), team })}`,
  );
  return { blob, filename: filename ?? `weekly-report-${dayParam(date)}.csv` };
}

export async function getDailyReport(date?: string, team?: string): Promise<DailyReport> {
  return apiFetch(`/api/reports/daily${qs({ date: dayParam(date), team })}`);
}

export async function getRangeReport(from: string, to: string, team?: string): Promise<RangeReport> {
  return apiFetch(`/api/reports/range${qs({ from, to, team })}`);
}

export async function getMonthlyReport(month?: string, team?: string): Promise<MonthlyReport> {
  return apiFetch(`/api/reports/monthly${qs({ month, team })}`);
}

/* ─── Retention (admin Settings) ─── */

export async function getRetentionStatus(): Promise<RetentionStatus> {
  return apiFetch("/api/admin/retention/status");
}

export async function purgeRetention(): Promise<RetentionPurgeResult> {
  return apiFetch("/api/admin/retention/purge", { method: "POST" });
}

/* ─── Employees CRUD + server filters ─── */

export async function listEmployeesPage(filters: EmployeeListFilters = {}): Promise<Page<Employee>> {
  return apiFetch(
    `/api/employees${qs({
      date: dayParam(filters.date),
      search: filters.search,
      team: filters.team,
      status: filters.status,
      sort: filters.sort,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    })}`,
  );
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  return apiFetch("/api/employees", { method: "POST", body: input });
}

export async function updateEmployee(id: string, input: Partial<EmployeeInput>): Promise<Employee> {
  return apiFetch(`/api/employees/${encodeURIComponent(id)}`, { method: "PATCH", body: input });
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiFetch(`/api/employees/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/* ─── Users (dashboard accounts) ─── */

export async function listUsers(filters: {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  sort?: string;
} = {}): Promise<Page<OrgUser>> {
  return apiFetch(
    `/api/users${qs({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      role: filters.role,
      isActive: filters.isActive,
      sort: filters.sort,
    })}`,
  );
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: Role;
  jobTitle?: string;
  team?: string;
}): Promise<OrgUser> {
  return apiFetch("/api/users", { method: "POST", body: input });
}

export async function inviteUser(input: {
  name: string;
  email: string;
  role?: Role;
  jobTitle?: string;
  team?: string;
}): Promise<UserInviteResult> {
  return apiFetch("/api/users/invite", { method: "POST", body: input });
}

export async function updateUser(
  id: string,
  input: Partial<{
    name: string;
    email: string;
    password: string;
    role: Role;
    jobTitle: string;
    team: string;
    isActive: boolean;
  }>,
): Promise<OrgUser> {
  return apiFetch(`/api/users/${encodeURIComponent(id)}`, { method: "PATCH", body: input });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/* ─── Auth extras (public + signed-in) ─── */

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch("/api/auth/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}

/** No auth. Always returns a generic message; may include resetToken in dev. */
export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  return apiFetch("/api/auth/forgot-password", { method: "POST", body: { email }, token: null });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
    token: null,
  });
}

export async function acceptInvite(token: string, password: string): Promise<AuthTokens> {
  return apiFetch("/api/auth/accept-invite", {
    method: "POST",
    body: { token, password },
    token: null,
  });
}

/* ─── Screenshots ─── */

export async function deleteScreenshot(id: string): Promise<void> {
  await apiFetch(`/api/screenshots/${encodeURIComponent(id)}`, { method: "DELETE" });
}
