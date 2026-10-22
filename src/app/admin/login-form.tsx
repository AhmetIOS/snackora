"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LockKeyhole } from "lucide-react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <div className="mx-auto max-w-md rounded-panel border border-line bg-paper p-7 sm:p-9">
      <span aria-hidden="true" className="grid size-11 place-items-center rounded-key bg-lime text-ink">
        <LockKeyhole className="size-5" />
      </span>
      <h1 className="mt-5 text-3xl">Yönetim paneli</h1>
      <p className="mt-2 text-ink/70">Ziyaretçi ve arama istatistiklerini görmek için şifreyi girin.</p>
      <form action={action} className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="font-semibold">Şifre</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            autoFocus
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "login-error" : undefined}
            className="min-h-12 rounded-key border border-ink/25 bg-cream px-4 text-base outline-none focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/30"
          />
        </label>
        {state.error ? (
          <p id="login-error" role="alert" className="flex items-start gap-2 rounded-key bg-error-soft p-3 text-sm text-error">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.error}
          </p>
        ) : null}
        <Button type="submit" plain disabled={pending} className="w-full">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Giriş yap
        </Button>
      </form>
    </div>
  );
}
