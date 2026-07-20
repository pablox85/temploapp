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
    <div className="border-b border-slate-100 px-3 py-3 last:border-0 sm:p-4">
      <div className="flex min-w-0 items-center gap-2">
        <form action={action} className="flex min-w-0 flex-1 items-center gap-2">
          <input name="name" defaultValue={item.name} required maxLength={160} className="input min-w-0 py-2.5" aria-label={`Editar ${item.name}`} />
          <SubmitButton pendingLabel="…" className="button-secondary min-h-10 shrink-0 px-3 text-xs">Guardar</SubmitButton>
        </form>
        <MutationButton action={() => deleteItemAction(item.id)} pendingLabel="…" className="button-danger min-h-10 shrink-0 px-3 text-xs" confirmMessage={`¿Eliminar “${item.name}”? También se quitarán todas sus asignaciones.`}>
          <TrashIcon className="size-4" />Eliminar
        </MutationButton>
      </div>
      {state.status !== "idle" && <div className="mt-2"><ActionMessage state={state} /></div>}
    </div>
  );
}
