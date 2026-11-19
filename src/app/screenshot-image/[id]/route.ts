import { API_URL } from "@/lib/session";

/** Streams a screenshot from the API. The signed token comes from the screenshot list; middleware requires a session. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/screenshots/${encodeURIComponent(id)}/image?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
  } catch {
    return new Response("Backend unavailable", { status: 502 });
  }
  if (!res.ok || !res.body) return new Response("Not found", { status: res.status === 404 ? 404 : 502 });

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
