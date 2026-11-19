import { cache } from "react";
import type {
  CurrentUser,
  Employee,
  EmployeeDetail,
  Overview,
  OrgSettings,
  Screenshot,
  WeeklyReport,
} from "./types";
import { ApiError, apiFetch } from "./api";

/**
 * Core dashboard reads used by existing pages.
 * New section‑1 APIs (devices, teams, exports, retention, invites, employee CRUD, …)
 * live in `./resources` — import from there when wiring new UI.
 */

const PAGE_LIMIT = 100;
const SCREENSHOT_PAGE_LIMIT = 200;

interface Page<T> {
  items: T[];
  page: number;
  pages: number;
}

/**
 * Agents report activity by their local calendar day, so "today" must be sent explicitly;
 * without a date the API falls back to the UTC day.
 */
function dayParam(date?: string) {
  if (date) return date;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

async function getAllPages<T>(path: string, limit: number): Promise<T[]> {
  const items: T[] = [];
  const sep = path.includes("?") ? "&" : "?";
  for (let page = 1; ; page++) {
    const res = await apiFetch<Page<T>>(`${path}${sep}limit=${limit}&page=${page}`);
    items.push(...res.items);
    if (page >= res.pages) return items;
  }
}

async function orNullIfMissing<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Image URLs point at the API, which browsers may not be able to reach; serve them through this app instead. */
function withProxiedImage(shot: Screenshot): Screenshot {
  if (!shot.imageUrl) return shot;
  const token = new URL(shot.imageUrl).searchParams.get("token") ?? "";
  return { ...shot, imageUrl: `/screenshot-image/${encodeURIComponent(shot.id)}?token=${encodeURIComponent(token)}` };
}

export const getCurrentUser = cache(() => apiFetch<CurrentUser>("/api/auth/me"));

export const getSettings = cache(() => apiFetch<OrgSettings>("/api/settings"));

export async function saveSettings(next: OrgSettings): Promise<OrgSettings> {
  return apiFetch<OrgSettings>("/api/settings", { method: "PUT", body: next });
}

export async function rotateEnrollmentCode(): Promise<OrgSettings> {
  return apiFetch<OrgSettings>("/api/settings/enrollment-code/rotate", { method: "POST" });
}

export const getEmployees = cache(() => getAllPages<Employee>(`/api/employees?date=${dayParam()}`, PAGE_LIMIT));

export async function getEmployeeDetail(id: string, date?: string): Promise<EmployeeDetail | null> {
  const detail = await orNullIfMissing(
    apiFetch<EmployeeDetail>(`/api/employees/${encodeURIComponent(id)}/activity?date=${dayParam(date)}`),
  );
  return detail && { ...detail, screenshots: detail.screenshots.map(withProxiedImage) };
}

export const getOverview = cache(() => apiFetch<Overview>(`/api/dashboard/overview?date=${dayParam()}`));

export async function getScreenshots(filters: { date?: string; employeeId?: string }): Promise<Screenshot[]> {
  const params = new URLSearchParams({ date: dayParam(filters.date) });
  if (filters.employeeId) params.set("employeeId", filters.employeeId);
  const shots = await orNullIfMissing(getAllPages<Screenshot>(`/api/screenshots?${params}`, SCREENSHOT_PAGE_LIMIT));
  return (shots ?? []).map(withProxiedImage);
}

export async function getWeeklyReport(date?: string): Promise<WeeklyReport> {
  return apiFetch<WeeklyReport>(`/api/reports/weekly?date=${dayParam(date)}`);
}
