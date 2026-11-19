"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "lucide-react";
import { loginAction, registerAction } from "@/app/login/actions";
import { Card } from "@/components/ui/Card";

type Mode = "login" | "register";

const inputCls =
  "w-full rounded-lg border border-ink-500 bg-ink-850 px-3 py-2 text-sm text-cream-100 outline-none placeholder:text-cream-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-600/25";

function Field({ label, hint, ...props }: { label: string; hint?: string } & React.ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-cream-200">{label}</span>
      <input className={inputCls} required {...props} />
      {hint && <span className="mt-1 block text-xs text-cream-400">{hint}</span>}
    </label>
  );
}

function ModeForm({ mode, onSwitch }: { mode: Mode; onSwitch: () => void }) {
  const isLogin = mode === "login";
  const [state, formAction, pending] = useActionState(isLogin ? loginAction : registerAction, null);

  return (
    <Card className="p-6">
      <h1 className="text-lg font-semibold text-cream-50">{isLogin ? "Sign in" : "Create your organization"}</h1>
      <p className="mt-1 text-sm text-cream-400">
        {isLogin ? "Use your admin or manager account." : "You'll be the admin of the new organization."}
      </p>

      <form action={formAction} className="mt-5 space-y-4">
        {!isLogin && (
          <>
            <Field label="Company name" name="companyName" minLength={2} maxLength={120} />
            <Field label="Your name" name="name" autoComplete="name" maxLength={120} />
          </>
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={isLogin ? undefined : 8}
          hint={isLogin ? undefined : "At least 8 characters."}
        />

        {state?.error && (
          <p className="flex items-start gap-2 rounded-lg bg-brand-900/40 px-3 py-2 text-sm text-brand-100 ring-1 ring-brand-600/40">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-cream-50 shadow-[0_0_20px_-6px_rgba(200,16,46,0.7)] hover:bg-brand-500 disabled:opacity-60"
        >
          {pending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-cream-400">
        {isLogin ? "New here? " : "Already have an account? "}
        <button type="button" onClick={onSwitch} className="font-medium text-brand-300 hover:text-brand-200">
          {isLogin ? "Create an organization" : "Sign in"}
        </button>
      </p>
    </Card>
  );
}

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  return <ModeForm key={mode} mode={mode} onSwitch={() => setMode(mode === "login" ? "register" : "login")} />;
}
