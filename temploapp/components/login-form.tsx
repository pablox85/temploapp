"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction } from "@/app/(auth)/login/actions";
import { ActionMessage } from "@/components/action-message";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action] = useActionState(loginAction, initialActionState);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status !== "error") return;
    if (passwordRef.current) {
      passwordRef.current.value = "";
      passwordRef.current.focus();
    }
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label htmlFor="email" className="label text-slate-200">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 hover:border-slate-600" placeholder="sarasa@sarasa.com" />
      </div>
      <div>
        <label htmlFor="password" className="label text-slate-200">Contraseña</label>
        <div className="relative">
          <input ref={passwordRef} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={6} className="input border-slate-700 bg-slate-900 pr-12 text-slate-100 placeholder:text-slate-500 hover:border-slate-600" placeholder="••••••••" />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-teal-300 focus-visible:text-teal-300" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}>
            {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        </div>
      </div>
      <ActionMessage state={state} />
      <SubmitButton pendingLabel="Ingresando…" className="button-primary w-full">Iniciar sesión</SubmitButton>
    </form>
  );
}
