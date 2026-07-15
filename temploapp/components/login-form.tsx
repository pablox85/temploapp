"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/(auth)/login/actions";
import { ActionMessage } from "@/components/action-message";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action] = useActionState(loginAction, initialActionState);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label htmlFor="name" className="label text-slate-200">Nombre de usuario</label>
        <input id="name" name="name" type="text" autoComplete="username" required maxLength={120} className="input border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 hover:border-slate-600" placeholder="Ej. Juan Pérez" />
      </div>
      <div>
        <label htmlFor="password" className="label text-slate-200">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={6} className="input border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 hover:border-slate-600" placeholder="••••••••" />
      </div>
      <ActionMessage state={state} />
      <SubmitButton pendingLabel="Ingresando…" className="button-primary w-full">Iniciar sesión</SubmitButton>
    </form>
  );
}
