"use client";

import { useMemo, useState } from "react";
import { deleteItemsAction } from "@/app/(dashboard)/dashboard/admin/actions";
import { selectItemAction, unselectItemAction } from "@/app/(dashboard)/dashboard/items/actions";
import { CheckIcon, SearchIcon, TrashIcon, UsersIcon } from "@/components/icons";
import { MutationButton } from "@/components/mutation-button";
import type { ItemWithSelection } from "@/lib/types/database";

type AssignmentFilter = "all" | "available" | "selected";

export function ItemList({ items, onlySelected = false, isAdmin = false, initialAssignmentFilter = "all" }: {
  items: ItemWithSelection[];
  onlySelected?: boolean;
  isAdmin?: boolean;
  initialAssignmentFilter?: AssignmentFilter;
}) {
  const [query, setQuery] = useState("");
  const [markedIds, setMarkedIds] = useState<ReadonlySet<string>>(new Set());
  const [purchasedIds, setPurchasedIds] = useState<ReadonlySet<string>>(new Set());
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>(initialAssignmentFilter);
  const [ownerId, setOwnerId] = useState("all");
  const owners = useMemo(() => {
    const uniqueOwners = new Map<string, NonNullable<ItemWithSelection["assigned_profile"]>>();
    items.forEach((item) => {
      if (item.assigned_profile?.full_name) uniqueOwners.set(item.assigned_profile.id, item.assigned_profile);
    });
    return [...uniqueOwners.values()].sort((a, b) => a.full_name.localeCompare(b.full_name, "es"));
  }, [items]);
  const filtered = useMemo(() => items.filter((item) => {
    const matchesSearch = item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase());
    const matchesSelection = !onlySelected || item.is_selected;
    const matchesAction = assignmentFilter === "all"
      || (assignmentFilter === "available" && item.is_available)
      || (assignmentFilter === "selected" && !item.is_available);
    const matchesOwner = ownerId === "all"
      || (ownerId === "unassigned" && item.assigned_profile === null)
      || item.assigned_profile?.id === ownerId;
    return matchesSearch && matchesSelection && matchesAction && matchesOwner;
  }), [assignmentFilter, items, onlySelected, ownerId, query]);
  const columns = "md:grid-cols-[minmax(0,1fr)_140px_minmax(170px,220px)_150px_88px]";
  const allItemsMarked = items.length > 0 && items.every((item) => markedIds.has(item.id));
  const purchasableMarkedIds = items
    .filter((item) => markedIds.has(item.id) && (isAdmin || item.is_selected))
    .map((item) => item.id);
  const allPurchasableMarkedItemsPurchased = purchasableMarkedIds.length > 0
    && purchasableMarkedIds.every((itemId) => purchasedIds.has(itemId));

  function toggleAllItems() {
    setMarkedIds(() => {
      if (allItemsMarked) return new Set();
      return new Set(items.map((item) => item.id));
    });
  }

  function markSelectedAsPurchased() {
    setPurchasedIds((current) => new Set([...current, ...purchasableMarkedIds]));
    setMarkedIds((current) => {
      const next = new Set(current);
      purchasableMarkedIds.forEach((itemId) => next.delete(itemId));
      return next;
    });
  }

  function unmarkSelectedAsPurchased() {
    setPurchasedIds((current) => {
      const next = new Set(current);
      purchasableMarkedIds.forEach((itemId) => next.delete(itemId));
      return next;
    });
    setMarkedIds((current) => {
      const next = new Set(current);
      purchasableMarkedIds.forEach((itemId) => next.delete(itemId));
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative max-w-md flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="input pl-11" placeholder="Buscar ítems…" aria-label="Buscar ítems" />
          </div>
          {!onlySelected && <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="w-full sm:w-auto">
              <label className="mb-1 block text-center text-xs font-semibold text-slate-500 dark:text-slate-400" htmlFor="item-action-filter">Artículos</label>
              <select id="item-action-filter" value={assignmentFilter} onChange={(event) => setAssignmentFilter(event.target.value as AssignmentFilter)} className="input min-w-48 py-2.5" aria-label="Filtrar por artículos">
                <option value="all">Todos</option>
                <option value="available">Disponibles</option>
                <option value="selected">Seleccionados</option>
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <label className="mb-1 block text-center text-xs font-semibold text-slate-500 dark:text-slate-400" htmlFor="item-owner-filter">Usuarios</label>
              <select id="item-owner-filter" value={ownerId} onChange={(event) => setOwnerId(event.target.value)} className="input min-w-52 py-2.5" aria-label="Filtrar por usuarios">
                <option value="all">Todos</option>
                {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.full_name}</option>)}
              </select>
            </div>
          </div>}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 self-end sm:self-auto">
          <button type="button" onClick={toggleAllItems} disabled={items.length === 0} className="button-secondary min-h-10 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50">
            {allItemsMarked ? "Quitar todos" : "Marcar todos"}
          </button>
          {purchasableMarkedIds.length > 0 && <>
            <button type="button" onClick={allPurchasableMarkedItemsPurchased ? unmarkSelectedAsPurchased : markSelectedAsPurchased} className={allPurchasableMarkedItemsPurchased ? "button-secondary min-h-10 px-3" : "button-primary min-h-10 px-3"}>
              {allPurchasableMarkedItemsPurchased ? "Descomprar" : <><CheckIcon className="size-4" />Comprado</>}
            </button>
            {isAdmin &&
            <MutationButton action={async () => {
              const result = await deleteItemsAction([...markedIds]);
              if (result.status === "success") setMarkedIds(new Set());
              return result;
            }} pendingLabel="Eliminando…" className="button-danger min-h-10 px-3" confirmMessage={`¿Eliminar ${markedIds.size === 1 ? "el ítem marcado" : `los ${markedIds.size} ítems marcados`}? También se quitarán sus asignaciones.`}>
              <TrashIcon className="size-4" />Eliminar
            </MutationButton>}
          </>}
          {!isAdmin && markedIds.size > 0 && purchasableMarkedIds.length === 0 && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Solo podés marcar como comprado tus ítems.</span>}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3">
        <div className={`hidden ${columns} border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid`}>
          <span>Ítem</span><span className="text-center">Selecciones</span><span className="text-center">Seleccionado por</span><span className="text-center">Acción</span><span className="text-center">Marcar</span>
        </div>
        {filtered.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-slate-500">No hay ítems que coincidan con esta búsqueda.</p>
        ) : filtered.map((item) => {
          const isMarked = markedIds.has(item.id);
          const isPurchased = purchasedIds.has(item.id);

          return <div key={item.id} className={`motion-card grid gap-3 border-b border-slate-100 px-5 py-4 transition-opacity duration-200 last:border-0 ${columns} ${isMarked || isPurchased ? "opacity-60" : "opacity-100"} md:items-center`}>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                {isPurchased ? (
                  <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700 dark:bg-teal-400/15 dark:text-teal-300">Comprado</span>
                ) : isMarked ? (
                  <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">Marcado</span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">Agregado el {new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.created_at))}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-slate-600 md:justify-center"><UsersIcon className="size-4 text-teal-600" />{item.selection_count} {item.selection_count === 1 ? "persona" : "personas"}</span>
            <div className="min-w-0 md:text-center">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">Seleccionado por</span>
              <p className={`truncate text-sm font-medium ${item.is_available ? "text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-300"}`} title={item.assigned_profile?.full_name ?? undefined}>
                {item.is_available
                  ? "Disponible"
                  : item.assigned_profile?.full_name || "Seleccionado"}
              </p>
            </div>
            <div className="text-right md:text-center">
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
            <label className="grid size-9 place-items-center rounded-lg transition hover:bg-teal-50 focus-within:ring-2 focus-within:ring-teal-500/20 dark:hover:bg-teal-400/10 md:justify-self-center" title={`${isMarked ? "Quitar marca de" : "Marcar"} ${item.name}`}>
              <input type="checkbox" checked={isMarked} onChange={(event) => setMarkedIds((current) => {
                const next = new Set(current);
                if (event.target.checked) next.add(item.id);
                else next.delete(item.id);
                return next;
              })} className="peer sr-only" aria-label={`${isMarked ? "Quitar marca de" : "Marcar"} ${item.name}`} />
              <span className="grid size-5 place-items-center rounded-md border border-slate-300 bg-white text-white shadow-sm transition peer-checked:border-teal-500 peer-checked:bg-teal-500 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-400/40 after:content-['✓'] after:text-xs after:font-bold after:opacity-0 after:transition-opacity peer-checked:after:opacity-100 dark:border-slate-600 dark:bg-slate-800" />
              <span className="md:sr-only">Marcar</span>
            </label>
          </div>;
        })}
      </div>
    </div>
  );
}
