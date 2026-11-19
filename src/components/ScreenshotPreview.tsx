import { ImageOff } from "lucide-react";
import type { Screenshot } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ScreenshotPreview({
  shot,
  blur = false,
  size = "sm",
}: {
  shot: Screenshot;
  blur?: boolean;
  size?: "sm" | "lg";
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-ink-600 bg-ink-700">
      {shot.imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URLs, host varies by deployment */}
          <img
            src={shot.imageUrl}
            alt={`${shot.app} — ${shot.title}`}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
          {blur && <div className="absolute inset-0 backdrop-blur-sm" />}
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 p-3 text-center text-cream-400">
          <ImageOff className={size === "lg" ? "h-8 w-8" : "h-5 w-5"} />
          <span className={size === "lg" ? "text-sm" : "text-[11px]"}>Image not available</span>
          <span className={cn("max-w-full truncate text-cream-400", size === "lg" ? "text-sm" : "text-[11px]")}>
            {shot.app}
          </span>
        </div>
      )}
    </div>
  );
}
