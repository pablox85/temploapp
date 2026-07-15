"use client";

import { useMemo, useState } from "react";
import { assignItemAction, removeAssignmentAction } from "@/app/(dashboard)/dashboard/admin/actions";
import { MutationButton } from "@/components/mutation-button";
import type { Item, Profile, UserItem } from "@/lib/types/database";

export function AdminUserCard({ profile, items, assignments }: { profile: Profile; items: Item[]; assignments: UserItem[] }) {
  const assignedIds = useMemo(() => new Set(assignments.filter((row) => row.user_id === profile.id).map((row) => row.item_id)), [assignments, profile.id]);
  const assignedItems = items.filter((item) => assignedIds.has(item.id));
  const availableItems = items.filter((item) => !assignedIds.has(item.id));
  const [selectedId, setSelectedId] = useState(availableItems[0]?.id ?? "");
  const effectiveSelectedId = availableItems.some((item) => item.id === selectedId)
    ? selectedId
    : (availableItems[0]?.id ?? "");

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{profile.full_name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{profile.role === "admin" ? "Administrador" : "Usuario"} · {assignedItems.length} asignados</p>
        </div>
        <span className={`badge ${profile.role === "admin" ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{profile.role}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {assignedItems.length === 0 && <p className="text-sm text-slate-400">Sin ítems asignados.</p>}
        {assignedItems.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-1 rounded-full bg-teal-50 py-1 pl-3 pr-1 text-sm text-teal-800 dark:bg-teal-400/10 dark:text-teal-200">
            {item.name}
            <MutationButton action={() => removeAssignmentAction(profile.id, item.id)} pendingLabel="…" className="grid size-6 place-items-center rounded-full text-teal-700 hover:bg-teal-100" confirmMessage={`¿Quitar “${item.name}” a ${profile.full_name}?`}>
              <span aria-label="Quitar asignación">×</span>
            </MutationButton>
          </span>
        ))}
      </div>

      {availableItems.length > 0 && (
        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
          <select value={effectiveSelectedId} onChange={(event) => setSelectedId(event.target.value)} className="input py-2.5" aria-label={`Ítem para asignar a ${profile.full_name}`}>
            {availableItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <MutationButton action={() => assignItemAction(profile.id, effectiveSelectedId)} pendingLabel="Asignando…" className="button-primary shrink-0">Asignar</MutationButton>
        </div>
      )}
    </article>
  );
}
