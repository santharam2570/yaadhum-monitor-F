"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import { getCurrentUser, rotateEnrollmentCode, saveSettings } from "@/lib/data";
import type { OrgSettings } from "@/lib/types";

type SettingsActionResult = { ok: true; settings: OrgSettings } | { ok: false; error: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  return user.role === "admin";
}

export async function saveSettingsAction(next: OrgSettings): Promise<SettingsActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Only admins can change settings." };
  if (!next.companyName.trim()) return { ok: false, error: "Company name is required." };
  if (next.workStart >= next.workEnd) return { ok: false, error: "Work end time must be after the start time." };
  if (!next.workDays.length) return { ok: false, error: "Pick at least one working day." };

  try {
    const settings = await saveSettings({ ...next, companyName: next.companyName.trim() });
    revalidatePath("/", "layout");
    return { ok: true, settings };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function rotateEnrollmentCodeAction(): Promise<SettingsActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Only admins can generate a new code." };

  try {
    const settings = await rotateEnrollmentCode();
    revalidatePath("/settings");
    return { ok: true, settings };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    throw e;
  }
}
