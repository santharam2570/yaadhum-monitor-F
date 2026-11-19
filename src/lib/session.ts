/** Shared by middleware (edge runtime) and server code, so it must not import next/headers. */

export const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

export const ACCESS_COOKIE = "yadhum_access";
export const REFRESH_COOKIE = "yadhum_refresh";

/** Drop the access cookie a little before the JWT expires so a request never races the expiry. */
const EXPIRY_MARGIN_MS = 30_000;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface CookieWriter {
  set(
    name: string,
    value: string,
    options: { httpOnly: boolean; secure: boolean; sameSite: "lax"; path: string; expires?: Date },
  ): unknown;
}

function tokenExpiry(token: string): Date | undefined {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? new Date(payload.exp * 1000) : undefined;
  } catch {
    return undefined;
  }
}

export function writeSessionCookies(store: CookieWriter, tokens: AuthTokens) {
  const base = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  const accessExpiry = tokenExpiry(tokens.accessToken);
  store.set(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    expires: accessExpiry && new Date(accessExpiry.getTime() - EXPIRY_MARGIN_MS),
  });
  store.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, expires: tokenExpiry(tokens.refreshToken) });
}
