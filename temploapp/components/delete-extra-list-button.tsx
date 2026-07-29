"use client";

import { deleteExtraListAction } from "@/app/(dashboard)/dashboard/extras/actions";
import { TrashIcon } from "@/components/icons";
import { MutationButton } from "@/components/mutation-button";

export function DeleteExtraListButton({
  listId,
  listName,
}: {
  listId: string;
  listName: string;
}) {
  return (
    <MutationButton
      action={() => deleteExtraListAction(listId)}
      pendingLabel="Eliminando…"
      className="button-danger min-h-9 px-3 py-2 text-xs"
      confirmMessage={`¿Eliminar definitivamente la lista “${listName}”? Esta acción no se puede deshacer.`}
    >
      <TrashIcon className="size-4" />Eliminar
    </MutationButton>
  );
}
