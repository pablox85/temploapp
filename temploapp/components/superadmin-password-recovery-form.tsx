"use client";

import { type FormEvent, useActionState, useEffect, useRef, useState } from "react";
import {
  generateSuperAdminPasswordRecoveryLinkAction,
  type GenerateSuperAdminPasswordRecoveryLinkResult,
} from "@/app/superadmin/tenants/new/actions";

const initialState: GenerateSuperAdminPasswordRecoveryLinkResult = {
  success: false,
  message: "",
};

export function SuperAdminPasswordRecoveryForm() {
  const [state, action, pending] = useActionState(
    generateSuperAdminPasswordRecoveryLinkAction,
    initialState,
  );
  const [clientError, setClientError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setCopyMessage("");
    setClientError(validEmail ? "" : "Ingresa un email válido.");
    if (!validEmail) event.preventDefault();
  }

  async function copyLink() {
    if (!state.success) return;

    try {
      await navigator.clipboard.writeText(state.link);
      setCopyMessage("Enlace copiado.");
    } catch {
      setCopyMessage("No se pudo copiar. Selecciona y copia el enlace manualmente.");
    }
  }

  const errorMessage = clientError || (!state.success ? state.fieldError : "");

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset disabled={pending} className="space-y-4 disabled:opacity-70">
        <div>
          <label className="label text-slate-200" htmlFor="recovery-email">Email del usuario</label>
          <input
            id="recovery-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="persona@ejemplo.com"
            className="input border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 hover:border-slate-600"
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? "recovery-email-error" : undefined}
          />
          {errorMessage && <p id="recovery-email-error" className="mt-1.5 text-sm text-rose-300">{errorMessage}</p>}
        </div>
      </fieldset>

      {!pending && !state.success && state.message && (
        <p aria-live="polite" role="status" className="rounded-xl bg-rose-500/15 px-3 py-2.5 text-sm text-rose-200">{state.message}</p>
      )}

      {!pending && state.success && (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3">
          <p aria-live="polite" role="status" className="text-sm font-medium text-amber-200">{state.message}</p>
          <p className="mt-2 text-sm leading-6 text-amber-100/85">Este enlace permite iniciar una sesión temporal como el usuario. Compártelo únicamente con la persona correspondiente.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={state.link} className="input min-w-0 flex-1 border-amber-400/30 bg-slate-950/70 text-xs text-slate-100" aria-label="Enlace de recuperación generado" onFocus={(event) => event.currentTarget.select()} />
            <button type="button" className="button-secondary shrink-0" onClick={copyLink}>Copiar enlace</button>
          </div>
          {copyMessage && <p aria-live="polite" role="status" className="mt-2 text-sm text-teal-200">{copyMessage}</p>}
        </div>
      )}

      <button type="submit" disabled={pending} className="button-secondary w-full border-slate-700 bg-slate-950 text-slate-100 hover:border-teal-400/60 hover:text-white">
        {pending ? "Generando enlace…" : "Generar enlace de recuperación"}
      </button>
    </form>
  );
}
