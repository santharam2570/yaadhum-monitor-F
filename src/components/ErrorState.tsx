"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCw } from "lucide-react";

export function ErrorState({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong while loading data from the server."
      : error.message || "Something went wrong while loading data from the server.";

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-rose-500/40 bg-ink-850 p-6 text-center shadow-sm">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h2 className="mt-3 text-base font-semibold text-cream-50">Couldn&apos;t load this page</h2>
        <p className="mt-1 text-sm text-cream-400">{message}</p>
        <button
          onClick={() =>
            startTransition(() => {
              router.refresh();
              reset();
            })
          }
          disabled={retrying}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-brand-700 disabled:opacity-60"
        >
          <RotateCw className={retrying ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {retrying ? "Retrying…" : "Try again"}
        </button>
      </div>
    </div>
  );
}
