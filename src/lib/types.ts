export type Role = "admin" | "manager" | "employee";
export type EmployeeStatus = "online" | "idle" | "offline";
export type Category = "productive" | "neutral" | "unproductive";
export type SpanCategory = Category | "idle";
export type UsageKind = "app" | "website";

export interface Device {
  os: "Windows" | "macOS";
  hostname: string;
  agentVersion: string;
}

export interface DailySummary {
  totalSec: number;
  activeSec: number;
  idleSec: number;
  productiveSec: number;
  neutralSec: number;
  unproductiveSec: number;
  productivity: number;
  firstSeenMin: number;
  lastSeenMin: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: EmployeeStatus;
  currentActivity: string;
  /** null until the desktop agent has enrolled a device */
  device: Device | null;
  today: DailySummary;
}

/** start/end are minutes from midnight */
export interface ActivitySpan {
  start: number;
  end: number;
  app: string;
  title: string;
  category: SpanCategory;
}

export interface AppUsage {
  name: string;
  kind: UsageKind;
  category: Category;
  seconds: number;
}

/** values are minutes within that hour */
export interface HourlyPoint {
  hour: string;
  productive: number;
  neutral: number;
  unproductive: number;
  idle: number;
}

export interface Screenshot {
  id: string;
  employeeId: string;
  employeeName: string;
  takenAtMin: number;
  app: string;
  title: string;
  category: Category;
  hue: number;
  imageUrl?: string | null;
}

export interface EmployeeDetail extends Employee {
  spans: ActivitySpan[];
  apps: AppUsage[];
  hourly: HourlyPoint[];
  screenshots: Screenshot[];
  weeklyHours: number[];
}

export interface Overview {
  counts: Record<EmployeeStatus, number>;
  totalActiveSec: number;
  totalIdleSec: number;
  productiveSec: number;
  neutralSec: number;
  unproductiveSec: number;
  avgProductivity: number;
  hourly: HourlyPoint[];
  topApps: AppUsage[];
  topWebsites: AppUsage[];
}

export interface WeeklyReportRow {
  employeeId: string;
  name: string;
  team: string;
  hours: number[];
  total: number;
  productivity: number;
}

export interface WeeklyReport {
  weekLabel: string;
  days: string[];
  rows: WeeklyReportRow[];
  /** Present on current backend weekly payload */
  weekStart?: string;
  weekEnd?: string;
}

/** GET /api/auth/me — unlike the dashboard endpoints, this one uses snake_case keys. */
export interface CurrentUser {
  id: string;
  org_id: string;
  name: string;
  email: string;
  role: Role;
  job_title: string;
  team: string;
}

export interface CategoryRule {
  name: string;
  kind: UsageKind;
  category: Category;
}

export interface OrgSettings {
  companyName: string;
  companyCode: string;
  workStart: string;
  workEnd: string;
  workDays: string[];
  idleThresholdMin: number;
  screenshotIntervalMin: number;
  blurScreenshots: boolean;
  retentionDays: number;
  trackWebsites: boolean;
  categoryRules: CategoryRule[];
}

/** Shared paginated list envelope from Flask. */
export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** GET /api/agent/downloads */
export interface AgentDownloadEntry {
  url: string | null;
  version: string | null;
  checksum?: string;
}

export interface AgentDownloads {
  windows: AgentDownloadEntry;
  macos: AgentDownloadEntry;
  releaseNotes?: string;
  /** Install help from GET /api/agent/downloads (env-overridable). */
  installSteps?: string[];
  mdmHint?: string | null;
}

/** GET /api/branding — public product chrome */
export interface Branding {
  productName: string;
  logoUrl: string | null;
  supportUrl: string | null;
}

/** GET /api/settings/schema */
export interface SettingsSchema {
  workDays: string[];
  idleThresholdMin: number[];
  screenshotIntervalMin: number[];
  retentionDays: number[];
  limits: {
    idleThresholdMin: { min: number; max: number };
    screenshotIntervalMin: { min: number; max: number };
    retentionDays: { min: number; max: number };
  };
}

/** Device inventory (GET /api/devices, GET /api/employees/:id/devices) */
export interface ManagedDevice {
  id: string;
  employeeId: string;
  os: string;
  hostname: string;
  agentVersion: string;
  isRevoked: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  revokedAt: string | null;
  /** Present on org-wide device list */
  employeeName?: string;
  employeeEmail?: string;
  team?: string;
}

/** GET /api/teams — id is null for free-text teams only present on employees */
export interface Team {
  id: string | null;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DailyReportRow {
  employeeId: string;
  name: string;
  team: string;
  hours: number;
  activeSec: number;
  idleSec: number;
  productiveSec: number;
  productivity: number;
}

export interface DailyReport {
  date: string;
  rows: DailyReportRow[];
}

export interface RangeReportRow {
  employeeId: string;
  name: string;
  team: string;
  hours: number[];
  total: number;
  activeSec: number;
  idleSec: number;
  productiveSec: number;
  productivity: number;
}

export interface RangeReport {
  from: string;
  to: string;
  dates: string[];
  rows: RangeReportRow[];
}

export interface MonthlyReportRow {
  employeeId: string;
  name: string;
  team: string;
  total: number;
  activeSec: number;
  idleSec: number;
  productiveSec: number;
  productivity: number;
}

export interface MonthlyReport {
  month: string;
  monthStart: string;
  monthEnd: string;
  dates: string[];
  rows: MonthlyReportRow[];
}

export interface RetentionDeletedCounts {
  spans: number;
  summaries: number;
  screenshots: number;
}

/** GET /api/admin/retention/status */
export interface RetentionStatus {
  retentionDays: number;
  windowStart: string;
  windowEnd: string;
  lastRunAt: string | null;
  lastDeleted?: RetentionDeletedCounts | null;
  lastCutoffDate?: string | null;
}

/** POST /api/admin/retention/purge */
export interface RetentionPurgeResult {
  ranAt: string;
  cutoffDate: string;
  retentionDays: number;
  deleted: RetentionDeletedCounts;
}

/** Dashboard login accounts (not monitored employees). */
export interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  jobTitle: string;
  team: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserInviteResult {
  id: string;
  email: string;
  name: string;
  role: Role;
  expiresAt: string;
  message: string;
  /** Present when mail is not configured (dev) */
  inviteToken?: string;
  inviteUrl?: string;
}

export interface ForgotPasswordResult {
  message: string;
  /** Present when mail is not configured (dev) */
  resetToken?: string;
  resetUrl?: string;
}

export interface EmployeeInput {
  name: string;
  email: string;
  /** Job title — API field alias is `role` */
  role?: string;
  team?: string;
}

export interface EmployeeListFilters {
  date?: string;
  search?: string;
  team?: string;
  status?: EmployeeStatus;
  sort?: "name" | "-name" | "createdAt" | "-createdAt";
  page?: number;
  limit?: number;
}
