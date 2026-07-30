"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  createInventoryEntryAction,
  deleteExtraListEntryAction,
  updateInventoryQuantityAction,
} from "@/app/(dashboard)/dashboard/extras/actions";
import { ActionMessage } from "@/components/action-message";
import {
  PlusIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  TrashIcon,
} from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { useExtraEntryMutation } from "@/components/use-extra-entry-mutation";
import { initialActionState } from "@/lib/action-state";
import type { InventoryListEntry } from "@/lib/types/database";

const inventoryNameCollator = new Intl.Collator("es", {
  numeric: true,
  sensitivity: "base",
});

export function ExtraInventoryList({
  listId,
  listName,
  entries,
}: {
  listId: string;
  listName: string;
  entries: InventoryListEntry[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const createAction = createInventoryEntryAction.bind(null, listId, listName);
  const [createState, formAction] = useActionState(createAction, initialActionState);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const mutation = useExtraEntryMutation();
  const totalUnits = entries.reduce((total, entry) => total + entry.quantity, 0);
  const sortedEntries = useMemo(() => {
    const direction = sortDirection === "ascending" ? 1 : -1;
    return [...entries].sort((left, right) => {
      const byName = inventoryNameCollator.compare(left.title, right.title);
      return byName === 0 ? left.id.localeCompare(right.id) : byName * direction;
    });
  }, [entries, sortDirection]);

  useEffect(() => {
    if (createState.status === "success") formRef.current?.reset();
  }, [createState]);

  function updateQuantity(entry: InventoryListEntry, nextQuantity: number) {
    if (!Number.isInteger(nextQuantity) || nextQuantity < 0 || nextQuantity > 999999 || nextQuantity === entry.quantity) return;
    mutation.run(entry.id, () => updateInventoryQuantityAction(listId, listName, entry.id, nextQuantity));
  }

  return (
    <div>
      <div className="grid gap-5 border-b border-slate-200 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end dark:border-slate-800">
        <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end">
          <div>
            <label htmlFor="inventory-item-name" className="label">Ítem</label>
            <input id="inventory-item-name" name="title" required maxLength={200} className="input" placeholder="Ej. Botellas de agua" />
          </div>
          <div>
            <label htmlFor="inventory-item-quantity" className="label">Cantidad</label>
            <input id="inventory-item-quantity" name="quantity" defaultValue="1" required type="number" min={1} max={999999} step={1} inputMode="numeric" className="input" />
          </div>
          <SubmitButton pendingLabel="Agregando…" className="button-primary w-full sm:w-auto">
            <PlusIcon className="size-4" />Agregar
          </SubmitButton>
        </form>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 lg:justify-end">
          <span><strong className="text-slate-900 dark:text-white">{entries.length}</strong> productos</span>
          <span><strong className="text-slate-900 dark:text-white">{totalUnits}</strong> unidades</span>
          <button
            type="button"
            onClick={() => setSortDirection((current) => current === "ascending" ? "descending" : "ascending")}
            className="button-secondary min-h-9 gap-1.5 px-3 py-2"
            aria-label={`Ordenado por nombre ${sortDirection === "ascending" ? "ascendente" : "descendente"}. Cambiar a orden ${sortDirection === "ascending" ? "descendente" : "ascendente"}.`}
            title={sortDirection === "ascending" ? "Cambiar a Z–A" : "Cambiar a A–Z"}
          >
            {sortDirection === "ascending"
              ? <SortAscendingIcon className="size-4" />
              : <SortDescendingIcon className="size-4" />}
            <span>{sortDirection === "ascending" ? "A–Z" : "Z–A"}</span>
          </button>
        </div>
        <div className="space-y-2 sm:col-span-full">
          <ActionMessage state={createState} />
          <ActionMessage state={mutation.state} />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="grid min-h-64 place-items-center p-8 text-center">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">El inventario está vacío</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Agrega el primer ítem a “{listName}”.</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedEntries.map((entry) => {
            const pending = mutation.pendingKey === entry.id;
            return (
              <div key={`${entry.id}-${entry.quantity}`} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-5 py-4 sm:px-6">
                <p className="min-w-0 truncate font-medium text-slate-900 dark:text-white">{entry.title}</p>
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <button type="button" onClick={() => updateQuantity(entry, entry.quantity - 1)} disabled={pending || entry.quantity === 0} className="grid size-9 place-items-center text-lg font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Consumir una unidad de ${entry.title}`} title="Consumir una unidad">−</button>
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    step={1}
                    inputMode="numeric"
                    defaultValue={entry.quantity}
                    disabled={pending}
                    onBlur={(event) => updateQuantity(entry, Number(event.currentTarget.value))}
                    className="h-9 w-14 border-x border-slate-200 bg-transparent px-1 text-center text-sm font-bold text-slate-900 outline-none focus:bg-teal-50 disabled:opacity-60 dark:border-slate-700 dark:text-white dark:focus:bg-teal-400/10"
                    aria-label={`Cantidad de ${entry.title}`}
                  />
                  <button type="button" onClick={() => updateQuantity(entry, entry.quantity + 1)} disabled={pending || entry.quantity === 999999} className="grid size-9 place-items-center text-lg font-semibold text-teal-600 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-teal-300 dark:hover:bg-teal-400/10" aria-label={`Agregar una unidad de ${entry.title}`} title="Agregar una unidad">+</button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Quitar “${entry.title}” del inventario?`)) {
                      mutation.run(entry.id, () => deleteExtraListEntryAction(listId, listName, entry.id, "inventory"));
                    }
                  }}
                  disabled={pending}
                  className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  aria-label={`Quitar ${entry.title} del inventario`}
                  title="Quitar ítem"
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
