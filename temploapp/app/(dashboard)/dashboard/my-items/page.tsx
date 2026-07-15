import Link from "next/link";
import { ItemList } from "@/components/item-list";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth";
import { getItems } from "@/lib/services/items";

export default async function MyItemsPage() {
  const profile = await requireProfile();
  const items = await getItems(profile.id);
  const selected = items.filter((item) => item.is_selected);
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8"><p className="text-sm font-semibold text-teal-600">TU SELECCIÓN</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Mis ítems</h1><p className="mt-2 text-slate-500">Administra los ítems que elegiste. Solo tú puedes quitar tus selecciones.</p></header>
      {selected.length > 0 ? <ItemList items={selected} onlySelected /> : (
        <div><EmptyState title="Todavía no seleccionaste nada" description="Explora la lista colaborativa para comenzar." /><div className="mt-4 text-center"><Link href="/dashboard/items" className="button-primary">Explorar ítems</Link></div></div>
      )}
    </div>
  );
}
