"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createNotesEntryAction,
  deleteExtraListEntryAction,
} from "@/app/(dashboard)/dashboard/extras/actions";
import { ActionMessage } from "@/components/action-message";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { useExtraEntryMutation } from "@/components/use-extra-entry-mutation";
import { initialActionState } from "@/lib/action-state";
import type { NotesListEntry } from "@/lib/types/database";

export function ExtraNotesList({
  listId,
  listName,
  entries,
}: {
  listId: string;
  listName: string;
  entries: NotesListEntry[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const createAction = createNotesEntryAction.bind(null, listId, listName);
  const [createState, formAction] = useActionState(createAction, initialActionState);
  const mutation = useExtraEntryMutation();

  useEffect(() => {
    if (createState.status === "success") formRef.current?.reset();
  }, [createState]);

  return (
    <div>
      <div className="grid gap-5 border-b border-slate-200 p-5 sm:p-6 dark:border-slate-800">
        <form ref={formRef} action={formAction} className="grid gap-4">
          <div>
            <label htmlFor="notes-entry-title" className="label">Título</label>
            <input id="notes-entry-title" name="title" required maxLength={200} className="input" placeholder="Ej. Preparativos del evento" />
          </div>
          <div>
            <label htmlFor="notes-entry-content" className="label">Nota</label>
            <textarea id="notes-entry-content" name="content" required maxLength={5000} rows={4} className="input min-h-28 resize-y" placeholder="Escribe una nota para esta lista…" />
          </div>
          <SubmitButton pendingLabel="Agregando…" className="button-primary w-full sm:w-fit"><PlusIcon className="size-4" />Agregar nota</SubmitButton>
        </form>
        <p className="text-sm text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">{entries.length}</strong> notas guardadas</p>
        <div className="space-y-2">
          <ActionMessage state={createState} />
          <ActionMessage state={mutation.state} />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="grid min-h-64 place-items-center p-8 text-center"><div><p className="font-semibold text-slate-900 dark:text-white">No hay notas todavía</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Escribe la primera nota de “{listName}”.</p></div></div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.map((entry) => (
            <article key={entry.id} className="flex gap-4 px-5 py-5 sm:px-6">
              <div className="min-w-0 flex-1">
                <h3 className="break-words font-semibold text-slate-900 dark:text-white">{entry.title}</h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-200">{entry.content}</p>
                <time dateTime={entry.created_at} className="mt-3 block text-xs text-slate-400">{new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.created_at))}</time>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Eliminar la nota “${entry.title}”?`)) {
                    mutation.run(entry.id, () => deleteExtraListEntryAction(listId, listName, entry.id, "notes"));
                  }
                }}
                disabled={mutation.pendingKey === entry.id}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                aria-label={`Quitar nota ${entry.title}`}
                title="Quitar nota"
              >
                <TrashIcon className="size-4" />
              </button>
            </article>
          ))}
        </div>
      )}

      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-800 sm:px-6">Guardado en Supabase y disponible para los administradores del tenant.</p>
    </div>
  );
}
