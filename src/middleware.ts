import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, API_URL, REFRESH_COOKIE, writeSessionCookies, type AuthTokens } from "@/lib/session";

async function refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
      cache: "no-store",
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  if (request.cookies.has(ACCESS_COOKIE)) return NextResponse.next();

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const tokens = refreshToken ? await refreshTokens(refreshToken) : null;
  if (tokens) {
    request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
    request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
    const response = NextResponse.next({ request });
    writeSessionCookies(response.cookies, tokens);
    return response;
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export const config = {
  matcher: ["/((?!login|_next/|brand/|favicon.ico|mockServiceWorker.js).*)"],
};
