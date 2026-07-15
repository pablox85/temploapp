"use client";

import { useActionState } from "react";
import { deleteItemAction, updateItemAction } from "@/app/(dashboard)/dashboard/admin/actions";
import { ActionMessage } from "@/components/action-message";
import { TrashIcon } from "@/components/icons";
import { MutationButton } from "@/components/mutation-button";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";
import type { Item } from "@/lib/types/database";

export function AdminItemEditor({ item }: { item: Item }) {
  const update = updateItemAction.bind(null, item.id);
  const [state, action] = useActionState(update, initialActionState);

  return (
    <div className="border-b border-slate-100 p-4 last:border-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <form action={action} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <input name="name" defaultValue={item.name} required maxLength={160} className="input py-2.5" aria-label={`Editar ${item.name}`} />
          <SubmitButton pendingLabel="Guardando…" className="button-secondary shrink-0">Guardar</SubmitButton>
        </form>
        <MutationButton action={() => deleteItemAction(item.id)} pendingLabel="Eliminando…" className="button-danger shrink-0" confirmMessage={`¿Eliminar “${item.name}”? También se quitarán todas sus asignaciones.`}>
          <TrashIcon className="size-4" />Eliminar
        </MutationButton>
      </div>
      <div className="mt-2"><ActionMessage state={state} /></div>
    </div>
  );
}
