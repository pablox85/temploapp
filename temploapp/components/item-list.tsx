"use client";

import { useMemo, useState } from "react";
import { selectItemAction, unselectItemAction } from "@/app/(dashboard)/dashboard/items/actions";
import { CheckIcon, SearchIcon, UsersIcon } from "@/components/icons";
import { MutationButton } from "@/components/mutation-button";
import type { ItemWithSelection } from "@/lib/types/database";

export function ItemList({ items, onlySelected = false }: { items: ItemWithSelection[]; onlySelected?: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => items.filter((item) => (!onlySelected || item.is_selected) && item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [items, onlySelected, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="input pl-11" placeholder="Buscar ítems…" aria-label="Buscar ítems" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
        <div className="hidden grid-cols-[minmax(0,1fr)_140px_minmax(170px,220px)_150px] border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
          <span>Ítem</span><span>Selecciones</span><span>Seleccionado por</span><span className="text-right">Acción</span>
        </div>
        {filtered.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-slate-500">No hay ítems que coincidan con esta búsqueda.</p>
        ) : filtered.map((item) => (
          <div key={item.id} className="motion-card grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_140px_minmax(170px,220px)_150px] md:items-center">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{item.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">Agregado el {new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.created_at))}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-slate-600"><UsersIcon className="size-4 text-teal-600" />{item.selection_count} {item.selection_count === 1 ? "persona" : "personas"}</span>
            <div className="min-w-0">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">Seleccionado por</span>
              <p className={`truncate text-sm font-medium ${item.is_available ? "text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-300"}`} title={item.assigned_profile?.full_name ?? undefined}>
                {item.is_available
                  ? "Disponible"
                  : item.assigned_profile?.full_name || "Seleccionado"}
              </p>
            </div>
            <div className="text-right">
              {item.is_selected ? (
                <MutationButton action={() => unselectItemAction(item.id)} pendingLabel="Quitando…" className="button-secondary border-teal-200 text-teal-700">
                  <CheckIcon className="size-4" />Quitar
                </MutationButton>
              ) : !item.is_available ? (
                <span className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Ocupado</span>
              ) : (
                <MutationButton action={() => selectItemAction(item.id)} pendingLabel="Seleccionando…" className="button-primary">
                  Seleccionar
                </MutationButton>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
