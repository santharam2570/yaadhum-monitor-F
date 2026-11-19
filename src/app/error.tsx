"use client";

import { ErrorState } from "@/components/ErrorState";

export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-ink-850">
      <ErrorState {...props} />
    </div>
  );
}
