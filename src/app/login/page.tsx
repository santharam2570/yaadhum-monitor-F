import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { BrandLogo } from "@/components/BrandLogo";

export const metadata: Metadata = { title: "Sign in · Yaadhum Monitor" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(200,16,46,0.22),transparent_60%),radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(232,168,74,0.1),transparent_50%)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo variant="full" priority />
          <p className="mt-4 text-sm text-cream-400">Employee monitoring dashboard</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
