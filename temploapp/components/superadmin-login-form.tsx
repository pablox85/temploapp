"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { superAdminLoginAction } from "@/app/(superadmin)/superadmin/login/actions";
import { ActionMessage } from "@/components/action-message";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function SuperAdminLoginForm() {
  const [state, action] = useActionState(superAdminLoginAction, initialActionState);
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
      <div>
        <label className="label text-slate-200" htmlFor="superadmin-email">Email</label>
        <input
          className="input border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 hover:border-slate-600"
          id="superadmin-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="superadmin@ejemplo.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label className="label text-slate-200" htmlFor="superadmin-password">Contraseña</label>
        <div className="relative">
          <input
            ref={passwordRef}
            className="input border-slate-700 bg-slate-950 pr-12 text-slate-100 placeholder:text-slate-500 hover:border-slate-600"
            id="superadmin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-violet-300 focus-visible:text-violet-300"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        </div>
      </div>

      <ActionMessage state={state} />
      <SubmitButton pendingLabel="Validando acceso…" className="button-primary min-h-12 w-full">
        Ingresar como SuperAdmin
      </SubmitButton>
    </form>
  );
}
