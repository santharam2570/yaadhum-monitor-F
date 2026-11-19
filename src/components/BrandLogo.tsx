import Image from "next/image";
import { cn } from "@/lib/utils";

type Variant = "full" | "mark" | "lockup";

const PRODUCT = "Yaadhum International Technologies";

export function BrandLogo({
  variant = "lockup",
  className,
  priority,
}: {
  variant?: Variant;
  className?: string;
  priority?: boolean;
}) {
  if (variant === "full") {
    return (
      <Image
        src="/brand/yaadhum-logo.jpg"
        alt={PRODUCT}
        width={480}
        height={384}
        priority={priority}
        className={cn("h-auto w-full max-w-[280px] object-contain sm:max-w-[340px]", className)}
      />
    );
  }

  if (variant === "mark") {
    return (
      <Image
        src="/brand/yaadhum-mark.jpg"
        alt={PRODUCT}
        width={72}
        height={72}
        priority={priority}
        className={cn("h-9 w-9 rounded-full object-cover ring-1 ring-brand-600/40", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/yaadhum-mark.jpg"
        alt=""
        width={72}
        height={72}
        priority={priority}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-brand-600/40"
        aria-hidden
      />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-semibold tracking-wide text-cream-50 uppercase">
          Yaadhum
        </span>
        <span className="block truncate text-[10px] font-medium tracking-[0.12em] text-brand-300 uppercase">
          International Technologies
        </span>
      </span>
    </span>
  );
}
