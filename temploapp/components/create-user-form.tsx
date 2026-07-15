"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAdminUserAction, type CreateAdminUserResult } from "@/lib/auth/admin-users";

const initialState: CreateAdminUserResult = { success: false, message: "" };

export function CreateUserForm({ dark = false }: { dark?: boolean }) {
  const [state, action, pending] = useActionState(createAdminUserAction, initialState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) ref.current?.reset(); }, [state]);
  const errors = state.success ? {} : state.fieldErrors ?? {};
  const inputClass = dark ? "block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-sm transition placeholder:text-slate-500 hover:border-slate-600 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" : "input";
  const labelClass = dark ? "mb-2 block text-sm font-semibold text-slate-200" : "label";
  return <form ref={ref} action={action} className="space-y-4">
    <fieldset disabled={pending} className="space-y-4 disabled:opacity-70">
      <div><label className={labelClass} htmlFor="fullName">Nombre completo</label><input aria-describedby={errors.fullName ? "fullName-error" : undefined} aria-invalid={Boolean(errors.fullName)} className={inputClass} id="fullName" name="fullName" required maxLength={120} placeholder="Ej. Juan Pérez" />{errors.fullName && <p id="fullName-error" className="mt-1 text-sm text-rose-400">{errors.fullName}</p>}</div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="password">Contraseña</label><input aria-describedby={errors.password ? "password-error" : undefined} aria-invalid={Boolean(errors.password)} className={inputClass} id="password" name="password" type="password" required minLength={6} />{errors.password && <p id="password-error" className="mt-1 text-sm text-rose-400">{errors.password}</p>}</div><div><label className={labelClass} htmlFor="confirmPassword">Confirmar contraseña</label><input aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined} aria-invalid={Boolean(errors.confirmPassword)} className={inputClass} id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />{errors.confirmPassword && <p id="confirmPassword-error" className="mt-1 text-sm text-rose-400">{errors.confirmPassword}</p>}</div></div>
      <div><label className={labelClass} htmlFor="role">Rol</label><select aria-describedby={errors.role ? "role-error" : undefined} aria-invalid={Boolean(errors.role)} className={inputClass} id="role" name="role" defaultValue="user"><option value="user">Usuario</option><option value="admin">Administrador</option></select>{errors.role && <p id="role-error" className="mt-1 text-sm text-rose-400">{errors.role}</p>}</div>
    </fieldset>
    {state.message && <p aria-live="polite" role="status" className={`rounded-xl px-3 py-2 text-sm ${state.success ? (dark ? "bg-teal-500/15 text-teal-200" : "bg-teal-50 text-teal-700") : (dark ? "bg-rose-500/15 text-rose-200" : "bg-rose-50 text-rose-700")}`}>{state.message}</p>}
    <button type="submit" disabled={pending} className="button-primary w-full">{pending ? "Creando usuario…" : "Crear usuario"}</button>
  </form>;
}
