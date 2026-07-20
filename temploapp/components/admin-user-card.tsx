"use client";

import { useMemo, useState } from "react";
import { reassignItemAction, removeAssignmentAction } from "@/app/(dashboard)/dashboard/admin/actions";
import { MutationButton } from "@/components/mutation-button";
import type { Item, Profile, UserItem } from "@/lib/types/database";

export function AdminUserCard({ profile, profiles, items, assignments }: { profile: Profile; profiles: Profile[]; items: Item[]; assignments: UserItem[] }) {
  const assignmentByItem = useMemo(() => new Map(assignments.map((row) => [row.item_id, row])), [assignments]);
  const profileById = useMemo(() => new Map(profiles.map((entry) => [entry.id, entry])), [profiles]);
  const assignedItems = useMemo(
    () => items.filter((item) => assignmentByItem.get(item.id)?.user_id === profile.id),
    [assignmentByItem, items, profile.id],
  );
  const [selectedId, setSelectedId] = useState(assignedItems[0]?.id ?? items.find((item) => !assignmentByItem.has(item.id))?.id ?? items[0]?.id ?? "");
  const effectiveSelectedId = items.some((item) => item.id === selectedId) ? selectedId : (items[0]?.id ?? "");
  const selectedAssignment = assignmentByItem.get(effectiveSelectedId);
  const selectedOwner = selectedAssignment ? profileById.get(selectedAssignment.user_id) : undefined;

  return (
    <article className="motion-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{profile.full_name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{profile.role === "admin" ? "Administrador" : "Usuario"} · {assignedItems.length === 0 ? "Sin ítems asignados" : `${assignedItems.length} ${assignedItems.length === 1 ? "ítem asignado" : "ítems asignados"}`}</p>
        </div>
        <span className={`badge ${profile.role === "admin" ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{profile.role}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {assignedItems.length === 0 && <p className="text-sm text-slate-400">Sin ítems asignados.</p>}
        {assignedItems.map((assignedItem) => (
          <span key={assignedItem.id} className="inline-flex items-center gap-1 rounded-full bg-teal-50 py-1 pl-3 pr-1 text-sm text-teal-800 dark:bg-teal-400/10 dark:text-teal-200">
            {assignedItem.name}
            <MutationButton action={() => removeAssignmentAction(profile.id, assignedItem.id)} pendingLabel="…" className="grid size-6 place-items-center rounded-full text-teal-700 hover:bg-teal-100" confirmMessage={`¿Quitar “${assignedItem.name}” a ${profile.full_name}?`}>
              <span aria-label="Quitar asignación">×</span>
            </MutationButton>
          </span>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
          <select value={effectiveSelectedId} onChange={(event) => setSelectedId(event.target.value)} className="input py-2.5" aria-label={`Ítem para asignar a ${profile.full_name}`}>
            {items.map((item) => {
              const owner = assignmentByItem.get(item.id) ? profileById.get(assignmentByItem.get(item.id)!.user_id) : undefined;
              return <option key={item.id} value={item.id}>{item.name}{owner ? ` — asignado a ${owner.full_name}` : " — disponible"}</option>;
            })}
          </select>
          <MutationButton action={() => reassignItemAction(profile.id, effectiveSelectedId)} pendingLabel="Reasignando…" className="button-primary shrink-0" confirmMessage={`¿Reasignar “${items.find((item) => item.id === effectiveSelectedId)?.name ?? "este ítem"}” a ${profile.full_name}${selectedOwner && selectedOwner.id !== profile.id ? `? Se liberará de ${selectedOwner.full_name}` : "?"}`}>Reasignar</MutationButton>
        </div>
      )}
    </article>
  );
}
