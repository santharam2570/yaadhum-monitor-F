import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, API_URL } from "./session";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  /** Defaults to the signed-in user's access token; pass a token explicitly (or null) to skip the login redirect. */
  token?: string | null;
}

interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: { loc?: (string | number)[]; msg?: string }[] };
}

async function toApiError(res: Response) {
  const body: ApiErrorBody | null = await res.json().catch(() => null);
  const detail = body?.error?.details?.[0];
  let message = body?.error?.message || `Request failed (${res.status})`;
  if (detail?.msg) {
    const field = detail.loc?.at(-1);
    const msg = detail.msg.replace(/^Value error, /, "");
    message = field ? `${field}: ${msg}` : msg;
  }
  return new ApiError(message, res.status, body?.error?.code ?? "error");
}

async function request(path: string, { method = "GET", body, token }: ApiOptions = {}): Promise<Response> {
  const authToken = token === undefined ? (await cookies()).get(ACCESS_COOKIE)?.value : token;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error(`Can't reach the backend at ${API_URL}. Make sure it is running (python run.py).`);
  }

  if (res.status === 401 && token === undefined) redirect("/login");
  if (!res.ok) throw await toApiError(res);
  return res;
}

/** Calls the Flask API from server components and server actions (JSON). */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await request(path, options);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** Binary/text downloads (e.g. GET /api/reports/weekly/export → CSV). */
export async function apiFetchBlob(path: string, options: ApiOptions = {}): Promise<{ blob: Blob; filename: string | null }> {
  const res = await request(path, options);
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return { blob: await res.blob(), filename: match?.[1] ?? null };
}
