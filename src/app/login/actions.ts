"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, writeSessionCookies, type AuthTokens } from "@/lib/session";

export type AuthFormState = { error: string } | null;

async function startSession(path: string, body: Record<string, string>): Promise<AuthFormState> {
  try {
    const tokens = await apiFetch<AuthTokens>(path, { method: "POST", body, token: null });
    writeSessionCookies(await cookies(), tokens);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
  redirect("/dashboard");
}

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export async function loginAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  return startSession("/api/auth/login", {
    email: field(form, "email"),
    password: String(form.get("password") ?? ""),
  });
}

export async function registerAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  return startSession("/api/auth/register", {
    companyName: field(form, "companyName"),
    name: field(form, "name"),
    email: field(form, "email"),
    password: String(form.get("password") ?? ""),
  });
}

export async function logoutAction() {
  const store = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    const token = store.get(name)?.value;
    if (token) await apiFetch("/api/auth/logout", { method: "POST", token }).catch(() => undefined);
    store.delete(name);
  }
  redirect("/login");
}
