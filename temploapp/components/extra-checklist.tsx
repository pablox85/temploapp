"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createChecklistEntryAction,
  deleteExtraListEntryAction,
  updateChecklistStatusAction,
} from "@/app/(dashboard)/dashboard/extras/actions";
import { ActionMessage } from "@/components/action-message";
import { CheckIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { useExtraEntryMutation } from "@/components/use-extra-entry-mutation";
import { initialActionState } from "@/lib/action-state";
import type { ChecklistListEntry } from "@/lib/types/database";

export function ExtraChecklist({
  listId,
  listName,
  entries,
}: {
  listId: string;
  listName: string;
  entries: ChecklistListEntry[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const createAction = createChecklistEntryAction.bind(null, listId, listName);
  const [createState, formAction] = useActionState(createAction, initialActionState);
  const mutation = useExtraEntryMutation();
  const completedCount = entries.filter((entry) => entry.is_completed).length;

  useEffect(() => {
    if (createState.status === "success") formRef.current?.reset();
  }, [createState]);

  return (
    <div>
      <div className="grid gap-5 border-b border-slate-200 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end dark:border-slate-800">
        <form ref={formRef} action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="checklist-item-name" className="label">Tarea</label>
            <input id="checklist-item-name" name="title" required maxLength={200} className="input" placeholder="Ej. Confirmar la reserva" />
          </div>
          <SubmitButton pendingLabel="Agregando…" className="button-primary w-full sm:w-auto"><PlusIcon className="size-4" />Agregar</SubmitButton>
        </form>
        <div className="text-sm text-slate-500 dark:text-slate-400 lg:text-right"><strong className="text-slate-900 dark:text-white">{completedCount}</strong> de {entries.length} completadas</div>
        <div className="space-y-2 sm:col-span-full">
          <ActionMessage state={createState} />
          <ActionMessage state={mutation.state} />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="grid min-h-64 place-items-center p-8 text-center"><div><p className="font-semibold text-slate-900 dark:text-white">El checklist está vacío</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Agrega la primera tarea a “{listName}”.</p></div></div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.map((entry) => {
            const pending = mutation.pendingKey === entry.id;
            return (
              <div key={`${entry.id}-${entry.is_completed}`} className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-opacity sm:px-6 ${entry.is_completed ? "opacity-60" : ""}`}>
                <button
                  type="button"
                  onClick={() => mutation.run(entry.id, () => updateChecklistStatusAction(listId, listName, entry.id, !entry.is_completed))}
                  disabled={pending}
                  className={`grid size-6 place-items-center rounded-md border transition disabled:opacity-40 ${entry.is_completed ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 text-transparent hover:border-teal-500 dark:border-slate-600"}`}
                  aria-label={`${entry.is_completed ? "Marcar como pendiente" : "Marcar como completada"}: ${entry.title}`}
                >
                  <CheckIcon className="size-4" />
                </button>
                <p className={`min-w-0 truncate font-medium text-slate-900 dark:text-white ${entry.is_completed ? "line-through" : ""}`}>{entry.title}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Quitar “${entry.title}” del checklist?`)) {
                      mutation.run(entry.id, () => deleteExtraListEntryAction(listId, listName, entry.id, "checklist"));
                    }
                  }}
                  disabled={pending}
                  className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  aria-label={`Quitar ${entry.title} del checklist`}
                  title="Quitar tarea"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-800 sm:px-6">Guardado en Supabase y disponible para los administradores del tenant.</p>
    </div>
  );
}
