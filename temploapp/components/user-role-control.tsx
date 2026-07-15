"use client";

import { useActionState } from "react";
import { updateProfileRoleAction, type UpdateProfileRoleResult } from "@/lib/auth/admin-roles";
import type { AppRole } from "@/lib/types/database";

const initialState: UpdateProfileRoleResult = { success: false, message: "" };

export function UserRoleControl({ profileId, role }: { profileId: string; role: AppRole }) {
  const actionWithProfile = updateProfileRoleAction.bind(null, profileId);
  const [state, action, pending] = useActionState(actionWithProfile, initialState);
  const selectId = `role-${profileId}`;
  return <form action={action} onSubmit={(event) => {
    const nextRole = new FormData(event.currentTarget).get("role");
    if (nextRole !== role && !window.confirm("¿Confirmas guardar este cambio de rol?")) event.preventDefault();
  }} className="mt-3 flex flex-wrap items-center gap-2">
    <label className="sr-only" htmlFor={selectId}>Rol de usuario</label>
    <select id={selectId} name="role" defaultValue={role} disabled={pending} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none">
      <option value="user">Usuario</option>
      <option value="admin">Administrador</option>
    </select>
    <button type="submit" disabled={pending} className="button-primary min-h-9 px-3 py-2">{pending ? "Guardando…" : "Guardar rol"}</button>
    {state.message && <p aria-live="polite" role="status" className={`w-full text-sm ${state.success ? "text-teal-300" : "text-rose-300"}`}>{state.message}</p>}
  </form>;
}
